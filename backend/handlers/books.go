package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	gormbulk "github.com/t-tiger/gorm-bulk-insert"
	"log"
	"main/db"
	"net/http"
	"strings"
	"time"
)

type PostBookPayload struct {
	db.Book
	Copies    int         `json:"copies"`
	AuthorIds []uuid.UUID `json:"author_ids"`
}

type CopiesResponse struct {
	Data []db.Copy `json:"data"`
}

type BooksResponse struct {
	Data []db.Book `json:"data"`
}

type BookResponse struct {
	Data db.Book `json:"data"`
}

// Common request errors
var errorBookISBN = errors.New("book isbn missing in request")

// queryBookWithParamISBN - Build gorm book query with id from url params.
func queryBookWithParamISBN(r *http.Request) (*db.Book, error) {
	params := mux.Vars(r)
	isbn := params["isbn"]
	if isbn == "" {
		return nil, errorBookISBN
	}

	query := &db.Book{ISBN: isbn}
	return query, nil
}

// queryBookWithParamID - Build gorm book query with id from url params.
func queryBookWithParamID(r *http.Request) (*db.Copy, error) {
	params := mux.Vars(r)
	id := params["id"]
	if id == "" {
		return nil, errorBookISBN
	}

	idInt := StringToUInt(id)
	query := &db.Copy{ID: idInt}

	return query, nil
}

// GetAllBooks - Get all books records.
func GetAllBooks(w http.ResponseWriter, r *http.Request) {
	var allBooks []db.Book
	db.GetAllBooksWithRelations(&allBooks)
	json.NewEncoder(w).Encode(BooksResponse{
		Data: allBooks,
	})
}

// GetBookByISBN - Retrieve a single book record by it's BookID (ID).
func GetBookByISBN(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var book db.Book
	db.GetBookWithRelations(query, &book)

	noRecord := book.ISBN == ""
	if noRecord {
		json.NewEncoder(w).Encode(&EmptyItemResponse{})
		return
	}

	json.NewEncoder(w).Encode(BookResponse{
		Data: book,
	})
}

// GetBookAuthors - Retrieve all authors of a book by it's BookID.
func GetBookAuthors(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var book db.Book
	db.MySQL.Preload("Authors").Where(query).First(&book)
	json.NewEncoder(w).Encode(AuthorsResponse{
		Data: book.Authors,
	})
}

// PostNewBook - Create a new book record.
func PostNewBook(w http.ResponseWriter, r *http.Request) {
	var payload PostBookPayload
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&payload)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Sanitize ISBNs as they are inserted.
	isbn := strings.Replace(payload.ISBN, "-", "", -1)

	// Create new Book object
	var book db.Book
	now := time.Now()
	book.ISBN = isbn
	book.CreatedAt = now
	book.UpdatedAt = now
	book.Title = payload.Title
	book.ImageURL = payload.ImageURL
	book.Description = payload.Description

	// Check the book doesn't already exist (including soft "deletes")
	var presentBook db.Book
	query := &db.Book{ISBN: isbn}
	db.MySQL.Unscoped().Where(query).First(&presentBook)
	isDeleted := presentBook.DeletedAt != nil
	if isDeleted {
		// FIXME: If there's time, this is a hack.
		// If it's been soft deleted we can just do a hard delete of
		//	the duplicate row so we can re-insert with normal flow.
		db.MySQL.Unscoped().Where(query).Delete(&db.Book{})
	}

	// If the ISBN already exists we create a new book copy.
	if presentBook.ISBN != "" && !isDeleted {
		errMsg := "book with that isbn already exists, creating new copy"
		HandleErrorResponse(w, errors.New(errMsg), http.StatusConflict)
		return
	}

	// Build book copies for insertion
	var copyRecords []interface{}
	for i := 0; i < payload.Copies; i++ {
		copyRecords = append(copyRecords, db.Copy{ISBN: isbn})
	}

	// Insert book copies
	errBulkCopies := gormbulk.BulkInsert(db.MySQL, copyRecords, 3000)
	if errBulkCopies != nil {
		log.Println(errBulkCopies.Error())
		return
	}

	// Insert and retrieve new book
	var newBook db.Book
	db.MySQL.Create(&book)
	db.GetBookWithRelations(query, &newBook)

	// Build book w/copies CREATE events
	var eventRecords []interface{}
	for _, bookCopy := range newBook.Copies {
		event := db.Event{
			BaseBook:  newBook.BaseBook,
			BookID:    bookCopy.ID,
			EventType: db.CREATE,
			ISBN:      isbn,
		}

		eventRecords = append(eventRecords, event)
	}

	// Insert creation events for all copies.
	errBulkBooksEvents := gormbulk.BulkInsert(db.MySQL, eventRecords, 3000)
	if errBulkBooksEvents != nil {
		log.Println(errBulkBooksEvents.Error())
		return
	}

	// Insert BooksAuthors relations from payload.
	errBulk := db.BulkInsertBooksAuthors(payload.AuthorIds, payload.ISBN)
	if errBulk != nil {
		HandleErrorResponse(w, errBulk, http.StatusBadRequest)
		return
	}

	// Return the newly created book with all relations in response
	var bookWithAll db.Book
	db.GetBookWithRelations(query, &bookWithAll)
	json.NewEncoder(w).Encode(BookResponse{
		Data: bookWithAll,
	})
}

// PatchUpdateBook - Update a book record by it's BookID.
func PatchUpdateBook(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Parse request body json.
	var requestBook db.Book
	decoder := json.NewDecoder(r.Body)
	errJSON := decoder.Decode(&requestBook)
	if errJSON != nil {
		HandleErrorResponse(w, errJSON, http.StatusBadRequest)
		return
	}

	var book db.Book
	db.MySQL.Unscoped().Where(query).First(&book)
	if book.DeletedAt != nil || book.ISBN == "" {
		msg := fmt.Sprintf("no book with isbn %s found", query.ISBN)
		err := errors.New(msg)
		HandleErrorResponse(w, err, http.StatusNotFound)
		return
	}

	// Update only what's supplied
	updates := map[string]interface{}{}
	if requestBook.ISBN != "" {
		updates["isbn"] = requestBook.ISBN
	}

	if requestBook.ImageURL != "" {
		updates["image"] = requestBook.ImageURL
	}

	if requestBook.Title != "" {
		updates["title"] = requestBook.Title
	}

	if requestBook.Description != "" {
		updates["description"] = requestBook.Description
	}

	// Apply updates and record requestBook event
	updates["updated_at"] = time.Now()
	db.MySQL.Model(&db.Book{ISBN: query.ISBN}).Updates(updates)

	var newBook db.Book
	db.GetBookWithRelations(query, &newBook)
	db.CreateNewBookEvents(newBook, db.UPDATE)
	json.NewEncoder(w).Encode(BookResponse{
		Data: newBook,
	})
}

// DeleteBookByISBN - Deletes a book by it's BookID.
func DeleteBookByISBN(w http.ResponseWriter, r *http.Request) {
	var book db.Book
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Delete and record the event
	db.MySQL.Where(query).First(&book)
	db.MySQL.Where(query).Delete(&db.Book{})
	db.CreateNewBookEvents(book, db.DELETE)
}

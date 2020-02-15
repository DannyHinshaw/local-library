package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	"log"
	"main/db"
	"net/http"
	"strings"
	"time"
)

type PostBookPayload struct {
	db.Book
	CopyID    uint        `json:"copy_id"`
	AuthorIds []uuid.UUID `json:"author_ids"`
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
	db.MySQL.Preload("Authors").Find(&allBooks)
	json.NewEncoder(w).Encode(BooksResponse{
		Data: allBooks,
	})
}

// GetBookByISBN - Retrieve a single book record by it's BookID (ID).
func GetBookByISBN(w http.ResponseWriter, r *http.Request) {
	var book db.Book
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	db.MySQL.
		Preload("Authors").
		Where(&db.Book{ISBN: query.ISBN}).
		First(&book)

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

	// Create new Book object
	var book db.Book
	now := time.Now()
	book.CreatedAt = now
	book.UpdatedAt = now
	book.Title = payload.Title
	book.Image = payload.Image
	book.Description = payload.Description

	// Sanitize ISBNs as they are inserted.
	book.ISBN = strings.Replace(payload.ISBN, "-", "", -1)

	// Check the book doesn't already exist (including "deletes")
	var presentBook db.Book
	query := &db.Book{ISBN: payload.ISBN}
	db.MySQL.Unscoped().Where(query).First(&presentBook)
	isDeleted := presentBook.DeletedAt != nil
	if isDeleted {
		// If it's been soft deleted we can just do a hard delete of
		//	the duplicate row so we can re-insert with normal flow.
		db.MySQL.Unscoped().Where(query).Delete(&db.Book{})
	}

	// If the ISBN already exists we create a new book copy.
	if presentBook.ISBN != "" && !isDeleted {
		log.Println("book with that isbn already exists, creating new copy")
		newCopy := db.Copy{ISBN: presentBook.ISBN}
		db.MySQL.Create(&newCopy)
		json.NewEncoder(w).Encode(BookResponse{
			Data: presentBook,
		})
		return
	}

	// Insert order matters
	db.MySQL.Create(&db.Copy{ISBN: book.ISBN})
	db.MySQL.Create(&book)
	db.CreateNewBookEvent(book, db.CREATE)

	// Insert BooksAuthors relations from payload.author_ids.
	errBulk := db.BulkInsertBooksAuthors(payload.AuthorIds, payload.ISBN)
	if errBulk != nil {
		HandleErrorResponse(w, errBulk, http.StatusBadRequest)
		return
	}

	// Return the newly created book in response
	var newBook db.Book
	db.MySQL.Preload("Authors").Where(query).First(&newBook)
	json.NewEncoder(w).Encode(BookResponse{
		Data: newBook,
	})
}

// PatchUpdateBook - Update a book record by it's BookID.
func PatchUpdateBook(w http.ResponseWriter, r *http.Request) {
	var requestBook db.Book
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Parse request body json.
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

	if requestBook.Image != "" {
		updates["image"] = requestBook.Image
	}

	if requestBook.Title != "" {
		updates["title"] = requestBook.Title
	}

	if requestBook.Description != "" {
		updates["description"] = requestBook.Description
	}

	// Apply updates and record requestBook event
	updates["updated_at"] = time.Now()
	db.MySQL.
		Model(&db.Book{ISBN: query.ISBN}).
		Updates(updates)
	db.CreateNewBookEvent(book, db.UPDATE)

	var newBook db.Book
	db.MySQL.Preload("Authors").Where(query).First(&newBook)
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
	db.CreateNewBookEvent(book, db.DELETE)
}

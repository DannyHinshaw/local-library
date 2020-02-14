package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	gormbulk "github.com/t-tiger/gorm-bulk-insert"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
)

type HealthResponse struct {
	Alive bool `json:"alive"`
}

type SeedBook struct {
	Book
	Author string `json:"author"`
}

type PostBookPayload struct {
	Book
	AuthorIds []uuid.UUID `json:"author_ids"`
}

type EmptyItemResponse struct {
	Data interface{} `json:"data"`
}

type AuthorsResponse struct {
	Data []Author `json:"data"`
}

type AuthorResponse struct {
	Data Author `json:"data"`
}

type BooksResponse struct {
	Data []Book `json:"data"`
}

type BookResponse struct {
	Data Book `json:"data"`
}

type EventsResponse struct {
	Data []Event `json:"data"`
}

// Common request errors
var errorBookISBN = errors.New("book isbn missing in request")
var errorAuthorID = errors.New("author id missing in request")

/* =======================================================
 *					Utility Functions
======================================================= */

// HandleErrorResponse - Util to handle endpoint error response.
func HandleErrorResponse(w http.ResponseWriter, err error, status int) {
	msg := err.Error()
	log.Println(msg)
	http.Error(w, msg, status)
}

// getRandomNumber - Generate random number for books copies.
func getRandomNumber() int {
	min := 1
	max := 3
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(max-min+1) + min
}

// getSeedDataAuthors - Retrieve test author data from json file.
func getSeedDataAuthors() []Author {
	file := "seed_data/authors.json"
	jsonFile, err := os.Open(file)
	if err != nil {
		log.Printf("error opening %s:: %s", file, err.Error())
		return nil
	}
	defer jsonFile.Close()

	var authors []Author
	byteSlice, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("error converting %s to byte slice:: %s", file, err.Error())
		return nil
	}

	jsonErr := json.Unmarshal(byteSlice, &authors)
	if jsonErr != nil {
		log.Printf("error unmarshalling %s to Authors:: %s", file, jsonErr.Error())
		return nil
	}

	return authors
}

// getSeedDataBooks - Retrieve test book data from json file.
func getSeedDataBooks() []SeedBook {
	file := "seed_data/books.json"
	jsonFile, err := os.Open(file)
	if err != nil {
		log.Printf("error opening %s:: %s", file, err.Error())
		return nil
	}
	defer jsonFile.Close()

	var books []SeedBook
	byteSlice, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("error converting %s to byte slice:: %s", file, err.Error())
		return nil
	}

	jsonErr := json.Unmarshal(byteSlice, &books)
	if jsonErr != nil {
		log.Printf("error unmarshalling %s to Books:: %s", file, jsonErr.Error())
		return nil
	}

	return books
}

// queryAuthorWithParamID - Build gorm author query with id from url params.
func queryAuthorWithParamID(r *http.Request) (*Author, error) {
	params := mux.Vars(r)
	id := params["id"]
	if id == "" {
		return nil, errorAuthorID
	}

	uid, err := uuid.FromString(id)
	if err != nil {
		return nil, err
	}

	query := &Author{ID: uid}
	return query, nil
}

// queryBookWithParamISBN - Build gorm book query with id from url params.
func queryBookWithParamISBN(r *http.Request) (*Book, error) {
	params := mux.Vars(r)
	isbn := params["isbn"]
	if isbn == "" {
		return nil, errorBookISBN
	}

	query := &Book{ISBN: isbn}
	return query, nil
}

// isInvalidAuthor - Check if author provided is missing data.
func isInvalidAuthor(author Author) bool {
	hasNoFirst := author.FirstName == ""
	hasNoLast := author.LastName == ""
	hasNoMiddle := author.Middle == ""

	return hasNoFirst && hasNoLast && hasNoMiddle
}

/* =======================================================
 *					Endpoint Handlers
======================================================= */

/* 				Utility Handlers
============================================== */

// GetHealthCheckHandler - Simple health check.
func GetHealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	body := &HealthResponse{Alive: true}
	json.NewEncoder(w).Encode(body)
}

// GetSeedDatabase - Start seeding database with test data.
func GetSeedDatabase(w http.ResponseWriter, r *http.Request) {

	// Wipe the db on every request for quick dev testing
	MySQL.Unscoped().Delete(&Book{})
	MySQL.Unscoped().Delete(&Event{})
	MySQL.Unscoped().Delete(&Author{})
	MySQL.Unscoped().Delete(&BooksAuthors{})

	// Gather all seed data for bulk inserts
	var insertBooksAuthorsRecords []interface{}
	var insertAuthorRecords []interface{}
	var insertBookRecords []interface{}

	authors := getSeedDataAuthors()
	books := getSeedDataBooks()
	for _, author := range authors {
		for _, book := range books {
			if book.Author == author.ID.String() {
				now := time.Now()
				newAuthor := Author{
					Base: Base{
						CreatedAt: now,
						UpdatedAt: now,
					},
					FirstName: author.FirstName,
					LastName:  author.LastName,
					Middle:    author.Middle,
					ID:        author.ID,
				}
				n := getRandomNumber()
				newBook := Book{
					ISBN: book.ISBN,
					Base: Base{
						CreatedAt: now,
						UpdatedAt: now,
					},
					BaseBook: BaseBook{
						Description: book.Description,
						Title:       book.Title,
						Available:   n,
						Copies:      n,
					},
				}

				insertBookRecords = append(insertBookRecords, newBook)
				insertAuthorRecords = append(insertAuthorRecords, newAuthor)
				insertBooksAuthorsRecords = append(insertBooksAuthorsRecords, &BooksAuthors{
					BookISBN: book.ISBN,
					AuthorID: author.ID,
				})
			}
		}
	}

	errBulkBooks := gormbulk.BulkInsert(MySQL, insertBookRecords, 3000)
	if errBulkBooks != nil {
		log.Println(errBulkBooks.Error())
		return
	}
	errBulkAuthors := gormbulk.BulkInsert(MySQL, insertAuthorRecords, 3000)
	if errBulkAuthors != nil {
		log.Println(errBulkAuthors.Error())
		return
	}
	errBulkBooksAuthors := gormbulk.BulkInsert(MySQL, insertBooksAuthorsRecords, 3000)
	if errBulkBooksAuthors != nil {
		log.Println(errBulkBooksAuthors.Error())
		return
	}

	var allAuthors []Author
	MySQL.Find(&allAuthors)

	var allBooks []Book
	MySQL.Find(&allBooks)

	if len(allAuthors) > 0 && len(allBooks) > 0 {
		w.Write([]byte("successfully seeded database"))
		return
	}

	responseErr := errors.New("something went wrong seeding database")
	HandleErrorResponse(w, responseErr, http.StatusInternalServerError)
}

/* 				Books Handlers
============================================== */

// GetAllBooks - Get all books records.
func GetAllBooks(w http.ResponseWriter, r *http.Request) {
	var allBooks []Book
	MySQL.Preload("Authors").Find(&allBooks)
	json.NewEncoder(w).Encode(BooksResponse{
		Data: allBooks,
	})
}

// GetBookByISBN - Retrieve a single book record by it's ISBN (ID).
func GetBookByISBN(w http.ResponseWriter, r *http.Request) {
	var book Book
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	MySQL.Preload("Authors").Where(query).First(&book)
	noRecord := book.ISBN == ""
	if noRecord {
		json.NewEncoder(w).Encode(&EmptyItemResponse{})
		return
	}

	json.NewEncoder(w).Encode(BookResponse{
		Data: book,
	})
}

// GetBookAuthors - Retrieve all authors of a book by it's ISBN.
func GetBookAuthors(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var book Book
	MySQL.Preload("Authors").Where(query).First(&book)
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
	var book Book
	now := time.Now()
	book.CreatedAt = now
	book.UpdatedAt = now
	book.ISBN = payload.ISBN
	book.Title = payload.Title
	book.Image = payload.Image
	book.Copies = payload.Copies
	book.Available = payload.Available
	book.Description = payload.Description

	// Check the book doesn't already exist (including "deletes")
	var presentBook Book
	query := &Book{ISBN: payload.ISBN}
	MySQL.Unscoped().Where(query).First(&presentBook)
	isDeleted := presentBook.DeletedAt != nil
	if isDeleted {
		// If it's been soft deleted we can just do a hard delete of
		//	the duplicate row so we can re-insert with normal flow.
		MySQL.Unscoped().Where(query).Delete(&Book{})
	}

	if presentBook.ISBN != "" && !isDeleted {
		responseErr := errors.New("book with that isbn already exists")
		HandleErrorResponse(w, responseErr, http.StatusConflict)
		return
	}

	// Record book event
	MySQL.Create(&book)
	CreateNewBookEvent(book, CREATE)

	// Insert BooksAuthors relations from payload.author_ids.
	errBulk := BulkInsertBooksAuthors(payload)
	if errBulk != nil {
		HandleErrorResponse(w, errBulk, http.StatusBadRequest)
		return
	}

	// Return the newly created book in response
	var newBook Book
	MySQL.Preload("Authors").Where(query).First(&newBook)
	json.NewEncoder(w).Encode(BookResponse{
		Data: newBook,
	})
}

// PatchUpdateBook - Update a book record by it's ISBN.
func PatchUpdateBook(w http.ResponseWriter, r *http.Request) {
	var requestBook Book
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

	var book Book
	MySQL.Unscoped().Where(query).First(&book)
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
	MySQL.Model(&Book{ISBN: query.ISBN}).Updates(updates)
	CreateNewBookEvent(book, UPDATE)

	var newBook Book
	MySQL.Preload("Authors").Where(query).First(&newBook)
	json.NewEncoder(w).Encode(BookResponse{
		Data: newBook,
	})
}

// DeleteBookByISBN - Deletes a book by it's ISBN.
func DeleteBookByISBN(w http.ResponseWriter, r *http.Request) {
	var book Book
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Delete and record the event
	MySQL.Where(query).First(&book)
	MySQL.Where(query).Delete(&Book{})
	CreateNewBookEvent(book, DELETE)
}

/* 				Authors Handlers
============================================== */

// GetAllAuthors - Retrieve all authors records.
func GetAllAuthors(w http.ResponseWriter, r *http.Request) {
	var allAuthors []Author
	MySQL.Preload("Books").Find(&allAuthors)
	json.NewEncoder(w).Encode(AuthorsResponse{
		Data: allAuthors,
	})
}

// GetAuthorByID - Retrieve a single author record by it's uuid.
func GetAuthorByID(w http.ResponseWriter, r *http.Request) {
	var author Author
	query, err := queryAuthorWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	MySQL.Where(query).First(&author)
	if isInvalidAuthor(author) {
		json.NewEncoder(w).Encode(EmptyItemResponse{})
		return
	}

	json.NewEncoder(w).Encode(AuthorResponse{
		Data: author,
	})
}

// GetAuthorBooks - Retrieve all books written by an author.
func GetAuthorBooks(w http.ResponseWriter, r *http.Request) {
	query, err := queryAuthorWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var author Author
	MySQL.Preload("Books").Where(query).First(&author)
	json.NewEncoder(w).Encode(BooksResponse{
		Data: author.Books,
	})
}

// PostNewAuthor - Creates a new author record.
func PostNewAuthor(w http.ResponseWriter, r *http.Request) {
	var author Author
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&author)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Check the author doesn't already exist
	var presentAuthor Author
	query := &Author{
		FirstName: author.FirstName,
		LastName:  author.LastName,
		Middle:    author.Middle,
	}

	// Handle conflicts
	MySQL.Where(query).First(&presentAuthor)
	if presentAuthor.FirstName != "" {
		responseErr := errors.New("author with that name already exists")
		HandleErrorResponse(w, responseErr, http.StatusConflict)
		return
	}

	// Create new Author
	now := time.Now()
	author.CreatedAt = now
	author.UpdatedAt = now
	author.ID = uuid.NewV4()
	MySQL.Create(&author)

	// Return the newly created author in response
	json.NewEncoder(w).Encode(AuthorResponse{
		Data: author,
	})
}

// PatchUpdateAuthor - Update an author record.
func PatchUpdateAuthor(w http.ResponseWriter, r *http.Request) {
	// TODO: Clean this handler up if there's time.
	a, errQ := queryAuthorWithParamID(r)
	if errQ != nil {
		HandleErrorResponse(w, errQ, http.StatusBadRequest)
		return
	}

	// Parse request body json.
	var author Author
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&author)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var currentAuthor Author
	MySQL.Unscoped().Where(Author{ID: a.ID}).First(&currentAuthor)
	if currentAuthor.DeletedAt != nil || isInvalidAuthor(currentAuthor) {
		msg := fmt.Sprintf("no author with id %s found", a.ID)
		err := errors.New(msg)
		HandleErrorResponse(w, err, http.StatusNotFound)
		return
	}

	// Update only what's supplied
	updates := map[string]interface{}{}
	if author.FirstName != "" {
		updates["first_name"] = author.FirstName
	}
	if author.LastName != "" {
		updates["last_name"] = author.LastName
	}

	author.ID = a.ID
	updates["updated_at"] = time.Now()
	MySQL.Model(&author).Updates(updates)

	var updatedAuthor Author
	query := Author{ID: author.ID}
	MySQL.Where(query).First(&updatedAuthor)
	json.NewEncoder(w).Encode(AuthorResponse{
		Data: updatedAuthor,
	})
}

// DeleteAuthorByID - Deletes an author record by it's uuid.
func DeleteAuthorByID(w http.ResponseWriter, r *http.Request) {
	var author Author
	query, err := queryAuthorWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	MySQL.Where(query).Delete(&author)
}

/* 				Events Handlers
============================================== */

// GetAllEvents - Retrieve all events from the events table..
func GetAllEvents(w http.ResponseWriter, r *http.Request) {
	var allEvents []Event
	MySQL.Model(&Event{}).Find(&allEvents)
	json.NewEncoder(w).Encode(EventsResponse{
		Data: allEvents,
	})
}

// GetEventsByISBN - Retrieve all events for a book by it's ISBN.
func GetEventsByISBN(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var allEvents []Event
	MySQL.Model(&Event{ISBN: query.ISBN}).Find(&allEvents)
	json.NewEncoder(w).Encode(EventsResponse{
		Data: allEvents,
	})
}

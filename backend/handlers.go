package main

import (
	"encoding/json"
	"errors"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	"io/ioutil"
	"log"
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

	query := &Author{
		Base: Base{
			ID: uid,
		},
	}

	return query, nil
}

// queryBookWithParamID - Build gorm book query with id from url params.
func queryBookWithParamID(r *http.Request) (*Book, error) {
	params := mux.Vars(r)
	isbn := params["isbn"]
	if isbn == "" {
		return nil, errorBookISBN
	}

	query := &Book{
		BaseBook: BaseBook{
			ISBN: isbn,
		},
	}

	return query, nil
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
	MySQL.Unscoped().Delete(&Author{})
	MySQL.Unscoped().Delete(&Event{})

	authors := getSeedDataAuthors()
	books := getSeedDataBooks()
	for _, author := range authors {
		for _, book := range books {
			if book.Author == author.ID.String() {
				now := time.Now()
				newAuthor := Author{
					Base: Base{
						ID:        author.ID,
						CreatedAt: now,
						UpdatedAt: now,
					},
					FirstName: author.FirstName,
					LastName:  author.LastName,
					Middle:    author.Middle,
				}
				newBook := Book{
					Base: Base{
						ID:        uuid.NewV4(),
						CreatedAt: now,
						UpdatedAt: now,
					},
					BaseBook: BaseBook{
						AuthorID:    newAuthor.ID,
						ISBN:        book.ISBN,
						Title:       book.Title,
						Description: book.Description,
					},
				}

				MySQL.Create(newAuthor)
				MySQL.Create(newBook)
			}
		}
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
	MySQL.Preload("Author").Find(&allBooks)
	json.NewEncoder(w).Encode(allBooks)
}

// GetBookByISBN - Retrieve a single book record by it's ISBN (ID).
func GetBookByISBN(w http.ResponseWriter, r *http.Request) {
	var book Book
	query, err := queryBookWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
	}

	MySQL.Preload("Author").Where(query).First(&book)
	json.NewEncoder(w).Encode(book)
}

// PostNewBook - Create a new book record.
func PostNewBook(w http.ResponseWriter, r *http.Request) {
	var book Book
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&book)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Check the book doesn't already exist
	var presentBook Book
	query := &Book{
		BaseBook: BaseBook{
			ISBN: book.ISBN,
		},
	}

	// Handle conflicts
	MySQL.Where(query).Find(&presentBook)
	if presentBook.ISBN != "" {
		responseErr := errors.New("book with that isbn already exists")
		HandleErrorResponse(w, responseErr, http.StatusConflict)
		return
	}

	// Create new Book
	now := time.Now()
	book.CreatedAt = now
	book.UpdatedAt = now
	book.ID = uuid.NewV4()
	MySQL.Create(book)

	// Record book event
	CreateNewBookEvent(book, CREATE)

	// Return the newly created book in response
	var newBook Book
	MySQL.Preload("Author").Where(query).Find(&newBook)
	json.NewEncoder(w).Encode(newBook)
}

// PatchUpdateBook - Update a book record by it's ISBN.
func PatchUpdateBook(w http.ResponseWriter, r *http.Request) {
	var book Book
	query, err := queryBookWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Parse request body json.
	decoder := json.NewDecoder(r.Body)
	errJSON := decoder.Decode(&book)
	if errJSON != nil {
		HandleErrorResponse(w, errJSON, http.StatusBadRequest)
		return
	}

	// Update only what's supplied
	updates := map[string]interface{}{}
	if book.ISBN != "" {
		updates["isbn"] = book.ISBN
	}
	if book.Title != "" {
		updates["title"] = book.Title
	}
	if book.Description != "" {
		updates["description"] = book.Description
	}
	if book.AuthorID.String() != "" {
		updates["author_id"] = book.AuthorID.String()
	}

	// Apply updates and record book event
	updates["updated_at"] = time.Now()
	MySQL.Model(&book).Updates(updates)
	CreateNewBookEvent(book, UPDATE)

	var newBook Book
	MySQL.Preload("Author").Where(query).Find(&newBook)
	json.NewEncoder(w).Encode(newBook)
}

// DeleteBookByISBN - Deletes a book by it's ISBN.
func DeleteBookByISBN(w http.ResponseWriter, r *http.Request) {
	var book Book
	query, err := queryBookWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Delete and record the event
	MySQL.Where(query).Delete(&book)
	CreateNewBookEvent(book, DELETE)
}

/* 				Authors Handlers
============================================== */

// GetAllAuthors - Retrieve all authors records.
func GetAllAuthors(w http.ResponseWriter, r *http.Request) {
	var allAuthors []Author
	MySQL.Find(&allAuthors)
	json.NewEncoder(w).Encode(allAuthors)
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
	json.NewEncoder(w).Encode(author)
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
	MySQL.Where(query).Find(&presentAuthor)
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
	MySQL.Create(author)

	// Return the newly created author in response
	json.NewEncoder(w).Encode(author)
}

// PatchUpdateAuthor - Update an author record.
func PatchUpdateAuthor(w http.ResponseWriter, r *http.Request) {
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

	var newAuthor Author
	query := Author{
		Base: Base{
			ID: a.ID,
		},
	}
	MySQL.Where(query).First(&newAuthor)
	json.NewEncoder(w).Encode(newAuthor)
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

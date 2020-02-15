package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/satori/go.uuid"
	"main/db"
	"net/http"
	"time"
)

type AuthorsResponse struct {
	Data []db.Author `json:"data"`
}

type AuthorResponse struct {
	Data db.Author `json:"data"`
}

var errorAuthorID = errors.New("author id missing in request")

// IsInvalidPerson - Check if author provided is missing data.
func IsInvalidPerson(person db.Person) bool {
	hasNoFirst := person.FirstName == ""
	hasNoLast := person.LastName == ""
	hasNoMiddle := person.Middle == ""

	return hasNoFirst && hasNoLast && hasNoMiddle
}

// queryAuthorWithParamID - Build gorm author query with id from url params.
func queryAuthorWithParamID(r *http.Request) (*db.Author, error) {
	params := mux.Vars(r)
	id := params["id"]
	if id == "" {
		return nil, errorAuthorID
	}

	uid, err := uuid.FromString(id)
	if err != nil {
		return nil, err
	}

	query := &db.Author{
		Person: db.Person{
			ID: uid,
		},
	}

	return query, nil
}

// GetAllAuthors - Retrieve all authors records.
func GetAllAuthors(w http.ResponseWriter, r *http.Request) {
	var allAuthors []db.Author
	queryParams := r.URL.Query()
	authors := queryParams.Get("books")
	if authors != "" {
		db.MySQL.Preload("Books").Find(&allAuthors)
	} else {
		db.MySQL.Find(&allAuthors)
	}

	json.NewEncoder(w).Encode(AuthorsResponse{
		Data: allAuthors,
	})
}

// GetAuthorByID - Retrieve a single author record by it's uuid.
func GetAuthorByID(w http.ResponseWriter, r *http.Request) {
	var author db.Author
	query, err := queryAuthorWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	db.MySQL.Where(query).First(&author)
	if IsInvalidPerson(author.Person) {
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

	var author db.Author
	db.MySQL.Preload("Books").Where(query).First(&author)
	json.NewEncoder(w).Encode(BooksResponse{
		Data: author.Books,
	})
}

// PostNewAuthor - Creates a new author record.
func PostNewAuthor(w http.ResponseWriter, r *http.Request) {
	var author db.Author
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&author)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Check the author doesn't already exist
	var presentAuthor db.Author
	query := &db.Author{Person: db.Person{
		FirstName: author.FirstName,
		LastName:  author.LastName,
		Middle:    author.Middle,
	}}

	// Handle conflicts
	db.MySQL.Where(query).First(&presentAuthor)
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
	db.MySQL.Create(&author)

	// Return the newly created author in response
	json.NewEncoder(w).Encode(AuthorResponse{
		Data: author,
	})
}

// PatchUpdateAuthor - Update an author record.
func PatchUpdateAuthor(w http.ResponseWriter, r *http.Request) {
	query, errQ := queryAuthorWithParamID(r)
	if errQ != nil {
		HandleErrorResponse(w, errQ, http.StatusBadRequest)
		return
	}

	// Parse request body json.
	var author db.Author
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&author)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	queryAuthorByID := db.Author{
		Person: db.Person{
			ID: query.ID,
		},
	}

	// Check the authors current state from db and handle errors.
	var currentAuthor db.Author
	db.MySQL.Unscoped().Where(queryAuthorByID).First(&currentAuthor)
	if currentAuthor.DeletedAt != nil || IsInvalidPerson(currentAuthor.Person) {
		msg := fmt.Sprintf("no author with id %s found", query.ID)
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
	if author.Middle != "" {
		updates["middle"] = author.Middle
	}

	// Apply updates to author.
	author.ID = query.ID
	updates["updated_at"] = time.Now()
	db.MySQL.Model(&author).Updates(updates)

	// Get the updated author object to return.
	var updatedAuthor db.Author
	db.MySQL.Where(query).First(&updatedAuthor)
	json.NewEncoder(w).Encode(AuthorResponse{
		Data: updatedAuthor,
	})
}

// DeleteAuthorByID - Deletes an author record by it's uuid.
func DeleteAuthorByID(w http.ResponseWriter, r *http.Request) {
	var author db.Author
	query, err := queryAuthorWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	db.MySQL.Where(query).Delete(&author)
}

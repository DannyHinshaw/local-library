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

// IsInvalidAuthor - Check if author provided is missing data.
func IsInvalidAuthor(author db.Author) bool {
	hasNoFirst := author.FirstName == ""
	hasNoLast := author.LastName == ""
	hasNoMiddle := author.Middle == ""

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
	db.MySQL.Preload("Books").Find(&allAuthors)
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
	if IsInvalidAuthor(author) {
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
	// TODO: Clean this handler up if there's time.
	a, errQ := queryAuthorWithParamID(r)
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

	var currentAuthor db.Author
	qByID := db.Author{
		Person: db.Person{
			ID: a.ID,
		},
	}
	db.MySQL.Unscoped().Where(qByID).First(&currentAuthor)
	if currentAuthor.DeletedAt != nil || IsInvalidAuthor(currentAuthor) {
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
	db.MySQL.Model(&author).Updates(updates)

	var updatedAuthor db.Author
	query := db.Author{Person: db.Person{
		ID: author.ID,
	}}

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

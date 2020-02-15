package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/t-tiger/gorm-bulk-insert"
	"io/ioutil"
	"log"
	"main/db"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

type HealthResponse struct {
	Alive bool `json:"alive"`
}

type SeedBook struct {
	db.Book
	Author string `json:"author"`
}

type EmptyItemResponse struct {
	Data interface{} `json:"data"`
}

type EventsResponse struct {
	Data []db.Event `json:"data"`
}

// HandleErrorResponse - Util to handle endpoint error response.
func HandleErrorResponse(w http.ResponseWriter, err error, status int) {
	msg := err.Error()
	log.Println(msg)
	http.Error(w, msg, status)
}

// StringToUInt - Handles converting a string to uint type.
func StringToUInt(s string) uint {
	u64, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		fmt.Println(err)
	}

	idInt := uint(u64)
	return idInt
}

// getSeedDataAuthors - Retrieve test author data from json file.
func getSeedDataAuthors() []db.Author {
	file := "seed_data/authors.json"
	jsonFile, err := os.Open(file)
	if err != nil {
		log.Printf("error opening %s:: %s", file, err.Error())
		return nil
	}
	defer jsonFile.Close()

	var authors []db.Author
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

// getSeedDataMembers - Retrieve test member data from json file.
func getSeedDataMembers() []db.Member {
	file := "seed_data/members.json"
	jsonFile, err := os.Open(file)
	if err != nil {
		log.Printf("error opening %s:: %s", file, err.Error())
		return nil
	}
	defer jsonFile.Close()

	var members []db.Member
	byteSlice, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("error converting %s to byte slice:: %s", file, err.Error())
		return nil
	}

	jsonErr := json.Unmarshal(byteSlice, &members)
	if jsonErr != nil {
		log.Printf("error unmarshalling %s to Members:: %s", file, jsonErr.Error())
		return nil
	}

	return members
}

// getSeedDataCheckouts - Retrieve test checkout data from json file.
func getSeedDataCheckouts() []db.Checkout {
	file := "seed_data/checkouts.json"
	jsonFile, err := os.Open(file)
	if err != nil {
		log.Printf("error opening %s:: %s", file, err.Error())
		return nil
	}
	defer jsonFile.Close()

	var checkout []db.Checkout
	byteSlice, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Printf("error converting %s to byte slice:: %s", file, err.Error())
		return nil
	}

	jsonErr := json.Unmarshal(byteSlice, &checkout)
	if jsonErr != nil {
		log.Printf("error unmarshalling %s to Checkouts:: %s", file, jsonErr.Error())
		return nil
	}

	return checkout
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

// getRandomNumber - Generate random number for books copies.
func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(max-min+1) + min
}

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
	db.MySQL.Unscoped().Delete(&db.Book{})
	db.MySQL.Unscoped().Delete(&db.Copy{})
	db.MySQL.Unscoped().Delete(&db.Event{})
	db.MySQL.Unscoped().Delete(&db.Author{})
	db.MySQL.Unscoped().Delete(&db.Member{})
	db.MySQL.Unscoped().Delete(&db.Checkout{})

	// Gather all seed data for bulk inserts
	var insertBooksAuthorsRecords []interface{}
	var insertCheckoutRecords []interface{}
	var insertMemberRecords []interface{}
	var insertAuthorRecords []interface{}
	var insertBookRecords []interface{}
	var insertCopyRecords []interface{}

	now := time.Now()
	base := db.Base{
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Members mock data builder
	members := getSeedDataMembers()
	for _, member := range members {
		newMember := db.Member{
			Person: db.Person{
				Base:      base,
				ID:        member.ID,
				FirstName: member.FirstName,
				LastName:  member.LastName,
				Middle:    member.Middle,
			},
		}

		insertMemberRecords = append(insertMemberRecords, newMember)
	}

	// Checkouts mock data builder
	checkouts := getSeedDataCheckouts()
	for _, checkout := range checkouts {
		hoursOut := getRandomNumber(24, 360)
		hoursReturned := getRandomNumber(24, 360)
		checkedOutTime := time.Now().Add(time.Hour * time.Duration(-hoursOut))
		returnedAtTime := time.Now().Add(time.Hour * time.Duration(-hoursReturned))
		newCheckout := db.Checkout{
			Base:       base,
			BookID:     checkout.BookID,
			MemberID:   checkout.MemberID,
			CheckedOut: checkedOutTime,
		}
		if returnedAtTime.Unix() > checkedOutTime.Unix() {
			newCheckout.Returned = &returnedAtTime
		}

		insertCheckoutRecords = append(insertCheckoutRecords, newCheckout)
	}

	// Authors/Books mock data builder
	authors := getSeedDataAuthors()
	books := getSeedDataBooks()
	for _, author := range authors {
		for _, book := range books {
			if book.Author == author.ID.String() {
				newAuthor := db.Author{
					Person: db.Person{
						Base:      base,
						ID:        author.ID,
						FirstName: author.FirstName,
						LastName:  author.LastName,
						Middle:    author.Middle,
					},
					Books: nil,
				}

				newBook := db.Book{
					ISBN: book.ISBN,
					Base: base,
					BaseBook: db.BaseBook{
						Description: book.Description,
						Title:       book.Title,
						Image:       book.Image,
					},
				}

				newCopy := &db.Copy{
					ISBN: book.ISBN,
				}

				insertBookRecords = append(insertBookRecords, newBook)
				insertCopyRecords = append(insertCopyRecords, newCopy)
				insertAuthorRecords = append(insertAuthorRecords, newAuthor)
				insertBooksAuthorsRecords = append(insertBooksAuthorsRecords, &db.BooksAuthors{
					BookISBN: book.ISBN,
					AuthorID: author.ID,
				})
			}
		}
	}

	errBulkCopies := gormbulk.BulkInsert(db.MySQL, insertCopyRecords, 3000)
	if errBulkCopies != nil {
		log.Println(errBulkCopies.Error())
		return
	}
	errBulkBooks := gormbulk.BulkInsert(db.MySQL, insertBookRecords, 3000)
	if errBulkBooks != nil {
		log.Println(errBulkBooks.Error())
		return
	}
	errBulkAuthors := gormbulk.BulkInsert(db.MySQL, insertAuthorRecords, 3000)
	if errBulkAuthors != nil {
		log.Println(errBulkAuthors.Error())
		return
	}
	errBulkMembers := gormbulk.BulkInsert(db.MySQL, insertMemberRecords, 3000)
	if errBulkMembers != nil {
		log.Println(errBulkMembers.Error())
		return
	}
	errBulkCheckouts := gormbulk.BulkInsert(db.MySQL, insertCheckoutRecords, 3000)
	if errBulkCheckouts != nil {
		log.Println(errBulkCheckouts.Error())
		return
	}
	errBulkBooksAuthors := gormbulk.BulkInsert(db.MySQL, insertBooksAuthorsRecords, 3000)
	if errBulkBooksAuthors != nil {
		log.Println(errBulkBooksAuthors.Error())
		return
	}

	var allBooksAuthors []db.BooksAuthors
	var allCheckouts []db.Checkout
	var allAuthors []db.Author
	var allMembers []db.Member
	var allCopies []db.Copy
	var allBooks []db.Book

	db.MySQL.Find(&allBooksAuthors)
	db.MySQL.Find(&allCheckouts)
	db.MySQL.Find(&allAuthors)
	db.MySQL.Find(&allMembers)
	db.MySQL.Find(&allCopies)
	db.MySQL.Find(&allBooks)

	hasBooksAuthors := len(allBooksAuthors) > 0
	hasCheckouts := len(allCheckouts) > 0
	hasAuthors := len(allAuthors) > 0
	hasMembers := len(allMembers) > 0
	hasCopies := len(allCopies) > 0
	hasBooks := len(allBooks) > 0

	success := hasBooksAuthors && hasCheckouts &&
		hasAuthors && hasMembers &&
		hasCopies && hasBooks

	if success {
		w.Write([]byte("successfully seeded database"))
		return
	}

	responseErr := errors.New("something went wrong seeding database")
	HandleErrorResponse(w, responseErr, http.StatusInternalServerError)
}
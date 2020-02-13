package main

import (
	uuid "github.com/satori/go.uuid"
	"github.com/t-tiger/gorm-bulk-insert"
	"time"
)

type BookEventType string

const (
	CREATE BookEventType = "CREATE"
	DELETE BookEventType = "DELETE"
	UPDATE BookEventType = "UPDATE"
)

/* 		  Base Models
============================= */

type Base struct {
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `gorm:"index" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"-"`
}

type BaseBook struct {
	Description string `gorm:"type:longtext" json:"description"`
	Available   int    `json:"available"`
	Copies      int    `json:"copies"`
	Title       string `json:"title"`
}

/* 			Tables
============================= */

type Author struct {
	Base
	ID        uuid.UUID `gorm:"index;primary_key;" json:"id"`
	Books     []Book    `gorm:"many2many:BooksAuthors;" json:"books,omitempty"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Middle    string    `json:"middle"`
}

type Book struct {
	Base
	BaseBook
	ISBN    string   `gorm:"index;primary_key;type:char(20);" json:"isbn"`
	Authors []Author `gorm:"many2many:BooksAuthors;" json:"authors,omitempty"`
}

type Event struct {
	BaseBook
	ID        int           `gorm:"index;primary_key;" json:"id"`
	ISBN      string        `gorm:"index;type:char(20);" json:"isbn"`
	EventType BookEventType `gorm:"index" json:"event_type"`
}

type BooksAuthors struct {
	BookISBN string    `gorm:"index:primary_key;type:char(20);" json:"book_isbn"`
	AuthorID uuid.UUID `gorm:"index;primary_key;" json:"author_id"`
}

func (ba *BooksAuthors) TableName() string {
	return "BooksAuthors"
}

/* 			Helpers
============================= */

// CreateBookEvent - Create a new book update event record and inserts it to events table.
func CreateNewBookEvent(book Book, eventType BookEventType) {
	event := Event{
		ISBN:      book.ISBN,
		EventType: eventType,
		BaseBook: BaseBook{
			Description: book.Description,
			Available:   book.Available,
			Copies:      book.Copies,
			Title:       book.Title,
		},
	}

	MySQL.Create(&event)
}

// BulkInsertBooksAuthors - Batch inserts to BooksAuthors relation table.
func BulkInsertBooksAuthors(payload PostBookPayload) error {
	var insertRecords []interface{}
	for _, id := range payload.AuthorIds {
		var rel = BooksAuthors{
			BookISBN: payload.ISBN,
			AuthorID: id,
		}
		insertRecords = append(insertRecords, rel)
	}

	errBulk := gormbulk.BulkInsert(MySQL, insertRecords, 3000)
	if errBulk != nil {
		return errBulk
	}

	return nil
}

package db

import (
	"github.com/satori/go.uuid"
	"github.com/t-tiger/gorm-bulk-insert"
	"time"
)

/* 		  Base Models
============================= */

type BookEventType string

type PostBookPayload struct {
	Book
	AuthorIds []uuid.UUID `json:"author_ids"`
}

const (
	CREATE BookEventType = "CREATE"
	DELETE BookEventType = "DELETE"
	UPDATE BookEventType = "UPDATE"
)

type Base struct {
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `gorm:"index" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"-"`
}

type BaseBook struct {
	Description string `gorm:"type:longtext" json:"description"`
	Title       string `json:"title"`
	Image       string `json:"image"`
}

type Person struct {
	Base
	ID        uuid.UUID `gorm:"index;primary_key;" json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Middle    string    `json:"middle"`
}

/* 			Tables
============================= */

type Member struct {
	Person
	Checkouts []Checkout `json:"checkouts,omitempty"`
}

type Author struct {
	Person
	Books []Book `gorm:"many2many:books_authors;" json:"books,omitempty"`
}

type Book struct {
	Base
	BaseBook
	ISBN    string   `gorm:"index;primary_key;type:char(13);" json:"isbn"`
	Authors []Author `gorm:"many2many:books_authors;" json:"authors,omitempty"`
}

// CopyID of a Book
type Copy struct {
	ID   uint   `gorm:"index;primary_key;" json:"id"`
	ISBN string `gorm:"index;primary_key;type:char(13);" json:"isbn"`
}

func (ba *Copy) TableName() string {
	return "copies"
}

type BooksAuthors struct {
	BookISBN string    `gorm:"index:primary_key;type:char(20);" json:"book_isbn"`
	AuthorID uuid.UUID `gorm:"index;primary_key;" json:"author_id"`
}

func (ba *BooksAuthors) TableName() string {
	return "books_authors"
}

type Checkout struct {
	Base
	BookID     uint       `gorm:"index;primary_key;auto_increment:false;" json:"book_id"`
	MemberID   uuid.UUID  `gorm:"index;primary_key;" json:"member_id"`
	CheckedOut time.Time  `gorm:"index;" json:"checked_out"`
	Returned   *time.Time `gorm:"index;" json:"returned"`
}

type Event struct {
	BaseBook
	ID        uint          `gorm:"index;primary_key;" json:"id"`
	ISBN      string        `gorm:"index;primary_key;" json:"isbn"`
	EventType BookEventType `gorm:"index" json:"event_type"`
}

/* 			Helpers
============================= */

// CreateBookEvent - Create a new book update event record and inserts it to events table.
func CreateNewBookEvent(book Book, eventType BookEventType) {
	event := Event{
		EventType: eventType,
		BaseBook:  book.BaseBook,
		ISBN:      book.ISBN,
	}

	MySQL.Create(&event)
}

// BulkInsertBooksAuthors - Batch inserts to BooksAuthors relation table.
func BulkInsertBooksAuthors(authorIDs []uuid.UUID, isbn string) error {
	var booksAuthorsRecords []interface{}
	for _, id := range authorIDs {
		var rel = BooksAuthors{
			BookISBN: isbn,
			AuthorID: id,
		}

		booksAuthorsRecords = append(booksAuthorsRecords, rel)
	}

	errBulk := gormbulk.BulkInsert(MySQL, booksAuthorsRecords, 3000)
	if errBulk != nil {
		return errBulk
	}

	return nil
}

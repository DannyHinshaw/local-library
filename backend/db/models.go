package db

import (
	"github.com/jinzhu/gorm"
	"github.com/satori/go.uuid"
	"github.com/t-tiger/gorm-bulk-insert"
	"log"
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
	Title       string `gorm:"type:varchar(12000)" json:"title"`
	ImageURL    string `gorm:"type:varchar(2083)" json:"image_url"`
	Description string `gorm:"type:longtext" json:"description"`
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
	ImageURL  string     `gorm:"type:varchar(2083)" json:"image_url"`
	Checkouts []Checkout `json:"checkouts,omitempty"`
}

type Author struct {
	Person
	Books []Book `gorm:"many2many:books_authors;" json:"books"`
}

type Book struct {
	Base
	BaseBook
	ISBN    string   `gorm:"index;primary_key;type:char(13);" json:"isbn"`
	Authors []Author `gorm:"many2many:books_authors;" json:"authors"`
	Copies  []Copy   `gorm:"foreignkey:ISBN;" json:"copies"`
}

// Copy of a Book
type Copy struct {
	ID   uint   `gorm:"index;primary_key;" json:"id"`
	ISBN string `gorm:"index;primary_key;type:char(13);" json:"isbn"`
}

func (ba *Copy) TableName() string {
	return "copies"
}

type BooksAuthors struct {
	BookISBN string    `gorm:"index:primary_key;type:char(13);" json:"book_isbn"`
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
	Base
	BaseBook
	ID        uint          `gorm:"index;primary_key;" json:"id"`
	ISBN      string        `gorm:"index;primary_key;" json:"isbn"`
	BookID    uint          `gorm:"index;auto_increment:false" json:"book_id"`
	EventType BookEventType `gorm:"index" json:"event_type"`
}

/* 			Helpers
============================= */

// preloadBookRelations - Preload book query with Authors & Copies relations.
func preloadBookRelations() *gorm.DB {
	return MySQL.Preload("Authors").Preload("Copies")
}

// GetBookWithRelations - Retrieve a single book with all relations.
func GetBookWithRelations(query *Book, book *Book) {
	preloadBookRelations().Where(query).First(book)
}

// GetAllBooksWithRelations - Retrieve all books with relations.
func GetAllBooksWithRelations(books *[]Book) {
	preloadBookRelations().Find(books)
}

// CreateBookEvent - Create a new book update event record and inserts it to events table.
func CreateNewBookEvents(book Book, eventType BookEventType) {
	var eventRecords []interface{}
	for _, bookCopy := range book.Copies {
		event := Event{
			EventType: eventType,
			BaseBook:  book.BaseBook,
			BookID:    bookCopy.ID,
			ISBN:      book.ISBN,
		}
		eventRecords = append(eventRecords, event)
	}

	errBulkBooksEvents := gormbulk.BulkInsert(MySQL, eventRecords, 3000)
	if errBulkBooksEvents != nil {
		log.Println(errBulkBooksEvents.Error())
		return
	}
}

// BulkInsertBooksAuthors - Batch inserts to BooksAuthors relation table.
func BulkInsertBooksAuthors(author_ids []uuid.UUID, isbn string) error {
	var booksAuthorsRecords []interface{}
	for _, id := range author_ids {
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

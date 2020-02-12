package main

import (
	uuid "github.com/satori/go.uuid"
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
	ID        uuid.UUID  `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `gorm:"index" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"-"`
}

type BaseBook struct {
	ISBN        string    `gorm:"primary_key;index;auto_increment:false;type:char(20);" json:"isbn"`
	Description string    `gorm:"type:longtext" json:"description"`
	Author      Author    `json:"author,omitempty"`
	AuthorID    uuid.UUID `json:"author_id,string"`
	Title       string    `json:"title"`
}

/* 			Tables
============================= */

type Book struct {
	Base
	BaseBook
	Events []Event `json:"events"`
}

type Event struct {
	BaseBook
	EventType BookEventType `gorm:"index" json:"event_type"`
}

type Author struct {
	Base
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Middle    string `json:"middle"`
}

/* 			Helpers
============================= */

// CreateBookEvent - Create a new book update event record and inserts it to events table.
func CreateNewBookEvent(book Book, eventType BookEventType) {
	event := Event{
		BaseBook: BaseBook{
			ISBN:        book.ISBN,
			Description: book.Description,
			AuthorID:    book.AuthorID,
			Title:       book.Title,
		},
		EventType: eventType,
	}

	MySQL.Create(event)
}

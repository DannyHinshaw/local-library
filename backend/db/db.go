package db

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"log"
	"os"
	"time"
)

var mysqlConnectString = os.Getenv("MYSQL_CONNECT_STRING")

// addConstraints - Since GORM annotations are still broken for foreign keys we do it manually here.
func addConstraints(db *gorm.DB) *gorm.DB {
	log.Println("adding db table constraints")
	db.Table("books_authors").AddForeignKey(
		"book_isbn",
		"books(isbn)",
		"CASCADE",
		"CASCADE",
	)
	db.Table("books_authors").AddForeignKey(
		"author_id",
		"authors(id)",
		"CASCADE",
		"CASCADE",
	)
	db.Model(&Book{}).AddForeignKey(
		"isbn",
		"copies(isbn)",
		"CASCADE",
		"CASCADE",
	)
	db.Model(&Checkout{}).AddForeignKey(
		"member_id",
		"members(id)",
		"CASCADE",
		"CASCADE",
	)
	db.Model(&Event{}).AddForeignKey(
		"isbn",
		"books(isbn)",
		"CASCADE",
		"CASCADE",
	)

	return db
}

// logTableCreated - Util func to log successful table creations.
func logTableCreated(s string) {
	log.Printf("DB:: successfully created '%s' table", s)
}

// initTables - Initialize all tables we need if not already present.
func initTables(db *gorm.DB) *gorm.DB {
	hasCheckout := db.HasTable(&Checkout{})
	if !hasCheckout {
		db.CreateTable(Checkout{})
		logTableCreated("checkouts")
	}

	hasAuthors := db.HasTable(&Author{})
	if !hasAuthors {
		db.CreateTable(Author{})
		logTableCreated("authors")
	}

	hasMembers := db.HasTable(&Member{})
	if !hasMembers {
		db.CreateTable(Member{})
		logTableCreated("members")
	}

	hasEvents := db.HasTable(&Event{})
	if !hasEvents {
		db.CreateTable(Event{})
		logTableCreated("events")
	}

	hasBooks := db.HasTable(&Book{})
	if !hasBooks {
		db.CreateTable(Book{})
		logTableCreated("books")
	}

	hasCopies := db.HasTable(&Copy{})
	if !hasCopies {
		db.CreateTable(Copy{})
		logTableCreated("copies")
	}

	// If the db is brand new, setup constraints.
	if !hasAuthors || !hasEvents || !hasBooks {
		return addConstraints(db)
	}

	return db
}

// getClient - Util function to create mysql gorm client (deferred Close() in root/db.go).
func getClient() *gorm.DB {
	interval := time.Duration(5) * time.Second
	retries := 10

	// Sometimes MySQL takes a little bit to be ready for connections.
	var client *gorm.DB
	for {
		if retries == 0 {
			// Exit application, docker-compose will restart to try again.
			panic("Could not establish connection to database")
		}

		if client != nil {
			break
		}

		db, err := gorm.Open("mysql", mysqlConnectString)
		if err == nil {
			client = db
			break
		}

		log.Printf("Couldn't establish connection to db %d retries left", retries)
		time.Sleep(interval)
		retries--
	}

	log.Println("db connection loop finished.")
	return initTables(client)
}

// Create global mysql gorm client
var MySQL = getClient()

package main

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"log"
	"os"
	"time"
)

var mysqlConnectString = os.Getenv("MYSQL_CONNECT_STRING")

// logTableCreated - Util func to log successful table creations.
func logTableCreated(s string) {
	log.Printf("DB:: successfully created '%s' table", s)
}

// addConstraints - Since GORM annotations are still broken for foreign keys we do it manually here.
func addConstraints(db *gorm.DB) *gorm.DB {
	log.Println("adding db table constraints")
	db.Model(Book{}).AddForeignKey(
		"author_id",
		"authors(id)",
		"SET DEFAULT",
		"SET DEFAULT",
	)
	db.Model(Event{}).AddForeignKey(
		"isbn",
		"books(isbn)",
		"SET DEFAULT",
		"SET DEFAULT",
	)

	return db
}

// initTables - Initialize all tables we need if not already present.
func initTables(db *gorm.DB) *gorm.DB {
	hasAuthors := db.HasTable(&Author{})
	if !hasAuthors {
		db.CreateTable(Author{})
		logTableCreated("authors")
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

	return addConstraints(db)
}

// getClient - Util function to create mysql gorm client (deferred Close() in root/main.go).
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

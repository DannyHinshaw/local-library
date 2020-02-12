package main

import (
	"context"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

// registerRoutes - Register all endpoint routes.
func registerRoutes() *mux.Router {

	// Base router/routes
	router := mux.NewRouter()

	// Register middlewares
	router.Use(RouteLogger)

	// Util handlers
	router.
		HandleFunc("/health", GetHealthCheckHandler).
		Methods("GET")
	router.
		HandleFunc("/seed", GetSeedDatabase).
		Methods("GET")

	// Authors
	router.
		HandleFunc("/authors", PostNewAuthor).
		Methods("POST")
	router.
		HandleFunc("/authors", GetAllAuthors).
		Methods("GET")
	router.
		HandleFunc("/authors/{id}", GetAuthorByID).
		Methods("GET")
	router.
		HandleFunc("/authors/{id}", PatchUpdateAuthor).
		Methods("PATCH")
	router.
		HandleFunc("/authors/{id}", DeleteAuthorByID).
		Methods("DELETE")

	// Books
	router.
		HandleFunc("/books", PostNewBook).
		Methods("POST")
	router.
		HandleFunc("/books", GetAllBooks).
		Methods("GET")
	router.
		HandleFunc("/books/{isbn}", GetBookByISBN).
		Methods("GET")
	router.
		HandleFunc("/books/{isbn}", PatchUpdateBook).
		Methods("PATCH")
	router.
		HandleFunc("/books/{isbn}", DeleteBookByISBN).
		Methods("DELETE")

	return router
}

// main - Setup http server.
func main() {
	var wait time.Duration
	r := registerRoutes()

	// Start server
	address := "0.0.0.0:8080"
	srv := &http.Server{
		Handler:      r,
		Addr:         address,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	// Run our server in a goroutine so that it doesn't block.
	go func() {
		log.Println("server listening @", address)
		if err := srv.ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	c := make(chan os.Signal, 1)

	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	// SIGKILL, SIGQUIT or SIGTERM (Ctrl+/) will not be caught.
	signal.Notify(c, os.Interrupt)

	// Close database connection gracefully
	defer MySQL.Close()

	// Block until we receive our signal.
	<-c

	// Create a deadline to wait for.
	ctx, cancel := context.WithTimeout(context.Background(), wait)
	defer cancel()

	// Doesn't block if no connections, but will otherwise wait
	// until the timeout deadline.
	srv.Shutdown(ctx)

	// Optionally, you could run srv.Shutdown in a goroutine and block on
	// <-ctx.Done() if your application should wait for other services
	// to finalize based on context cancellation.
	log.Println("shutting down")
	os.Exit(0)
}

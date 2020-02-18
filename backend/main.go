package main

import (
	"context"
	"github.com/gorilla/mux"
	"log"
	"main/db"
	"main/handlers"
	"net/http"
	"os"
	"os/signal"
	"time"
)

// RouteLogger - Logs url routes as requests come in.
func RouteLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, "-", r.RequestURI)
		next.ServeHTTP(w, r)
	})
}

// registerRoutes - Register all endpoint routes.
func registerRoutes() *mux.Router {

	// Base router/routes
	router := mux.NewRouter()

	// Register middlewares
	router.Use(RouteLogger)

	// Util handlers
	router.
		HandleFunc("/health", handlers.GetHealthCheckHandler).
		Methods("GET")
	router.
		HandleFunc("/seed", handlers.GetSeedDatabase).
		Methods("GET")

	// Authors
	router.
		HandleFunc("/authors", handlers.PostNewAuthor).
		Methods("POST")
	router.
		HandleFunc("/authors", handlers.GetAllAuthors).
		Methods("GET")
	router.
		HandleFunc("/authors/{id}", handlers.GetAuthorByID).
		Methods("GET")
	router.
		HandleFunc("/authors/{id}/books", handlers.GetAuthorBooks).
		Methods("GET")
	router.
		HandleFunc("/authors/{id}", handlers.PatchUpdateAuthor).
		Methods("PATCH")
	router.
		HandleFunc("/authors/{id}", handlers.DeleteAuthorByID).
		Methods("DELETE")

	// Books
	router.
		HandleFunc("/books", handlers.PostNewBook).
		Methods("POST")
	router.
		HandleFunc("/books", handlers.GetAllBooks).
		Methods("GET")
	router.
		HandleFunc("/books/{isbn}", handlers.GetBookByISBN).
		Methods("GET")
	router.
		HandleFunc("/books/{isbn}/authors", handlers.GetBookAuthors).
		Methods("GET")
	router.
		HandleFunc("/books/{isbn}", handlers.PatchUpdateBook).
		Methods("PATCH")
	router.
		HandleFunc("/books/{isbn}", handlers.DeleteBookByISBN).
		Methods("DELETE")

	// Checkouts
	router.
		HandleFunc("/checkouts", handlers.PostNewCheckouts).
		Methods("POST")
	router.
		HandleFunc("/checkouts", handlers.GetAllCheckouts).
		Methods("GET")
	router.
		HandleFunc("/checkouts/{member_id}", handlers.GetCheckoutsByMemberID).
		Methods("GET")
	router.
		HandleFunc("/checkouts", handlers.PatchReturnCheckout).
		Methods("PATCH")

	// Events
	router.
		HandleFunc("/events/books/{isbn}", handlers.GetEventsByBookISBN).
		Methods("GET")
	router.
		HandleFunc("/events", handlers.GetAllEvents).
		Methods("GET")

	// Members
	router.
		HandleFunc("/members", handlers.PostNewMember).
		Methods("POST")
	router.
		HandleFunc("/members", handlers.GetAllMembers).
		Methods("GET")
	router.
		HandleFunc("/members/{id}", handlers.GetMemberByID).
		Methods("GET")
	router.
		HandleFunc("/members/{id}", handlers.PatchUpdateMember).
		Methods("PATCH")
	router.
		HandleFunc("/members/{id}", handlers.DeleteMemberByID).
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
		log.Println("application is ready, view it in browser @ http://localhost:8000")
		if err := srv.ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	c := make(chan os.Signal, 1)

	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	// SIGKILL, SIGQUIT or SIGTERM (Ctrl+/) will not be caught.
	signal.Notify(c, os.Interrupt)

	// Close database connection gracefully
	//db.MySQL.LogMode(true)
	defer db.MySQL.Close()

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

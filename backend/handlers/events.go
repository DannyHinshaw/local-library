package handlers

import (
	"encoding/json"
	"main/db"
	"net/http"
)

// GetAllEvents - Retrieve all events from the events table..
func GetAllEvents(w http.ResponseWriter, r *http.Request) {
	var allEvents []db.Event
	db.MySQL.Model(&db.Event{}).Find(&allEvents)
	json.NewEncoder(w).Encode(EventsResponse{
		Data: allEvents,
	})
}

// GetEventsByBookISBN - Retrieve all events for a book by it's BookID.
func GetEventsByBookISBN(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamISBN(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var allEvents []db.Event
	db.MySQL.Where("isbn = ?", query.ISBN).Find(&allEvents)
	json.NewEncoder(w).Encode(EventsResponse{
		Data: allEvents,
	})
}

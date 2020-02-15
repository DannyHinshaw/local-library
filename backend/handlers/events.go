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

// GetEventsByBookID - Retrieve all events for a book by it's BookID.
func GetEventsByBookID(w http.ResponseWriter, r *http.Request) {
	query, err := queryBookWithParamID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var allEvents []db.Event
	db.MySQL.Model(&db.Event{ISBN: query.ISBN}).Find(&allEvents)
	json.NewEncoder(w).Encode(EventsResponse{
		Data: allEvents,
	})
}

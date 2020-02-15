package handlers

import (
	"encoding/json"
	"errors"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	"main/db"
	"net/http"
	"time"
)

type CheckoutsResponse struct {
	Data []db.Checkout `json:"data"`
}

type CheckoutResponse struct {
	Data db.Checkout `json:"data"`
}

type CheckoutQueryPayload struct {
	BookID   uint      `json:"book_id"`
	MemberID uuid.UUID `json:"member_id"`
}

// Common request errors
var errorBookID = errors.New("book id missing in request")

// queryCheckoutWithParamBookID - Build gorm book query with id from url params.
func queryCheckoutWithParams(r *http.Request) (*db.Checkout, error) {
	params := mux.Vars(r)
	bookID := params["book_id"]
	if bookID == "" {
		return nil, errorBookID
	}

	memberID := params["memberID"]
	if memberID == "" {
		return nil, errorMemberID
	}

	mID := uuid.FromStringOrNil(memberID)
	bID := StringToUInt(bookID)
	query := &db.Checkout{
		MemberID: mID,
		BookID:   bID,
	}

	return query, nil
}

// queryCheckoutWithParamMemberID - Build gorm book query with id from url params.
func queryCheckoutWithParamMemberID(r *http.Request) (*db.Checkout, error) {
	params := mux.Vars(r)
	memberId := params["member_id"]
	if memberId == "" {
		return nil, errorMemberID
	}

	query := &db.Checkout{
		MemberID: uuid.FromStringOrNil(memberId),
	}

	return query, nil
}

// GetAllCheckouts - Get all checkout records.
func GetAllCheckouts(w http.ResponseWriter, r *http.Request) {
	var allCheckouts []db.Checkout
	db.MySQL.Find(&allCheckouts)
	json.NewEncoder(w).Encode(CheckoutsResponse{
		Data: allCheckouts,
	})
}

// GetCheckoutsByMemberID - Get all checkout records.
func GetCheckoutsByMemberID(w http.ResponseWriter, r *http.Request) {
	query, err := queryCheckoutWithParamMemberID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var allCheckouts []db.Checkout
	db.MySQL.Where(query).Find(&allCheckouts)
	json.NewEncoder(w).Encode(CheckoutsResponse{
		Data: allCheckouts,
	})

}

// PostNewCheckout - Checkout a book for a member.
func PostNewCheckout(w http.ResponseWriter, r *http.Request) {
	var checkout db.Checkout
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&checkout)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	checkout.CheckedOut = time.Now()
	db.MySQL.Create(&checkout)
	json.NewEncoder(w).Encode(CheckoutResponse{
		Data: checkout,
	})
}

// PatchReturnCheckout - Update to return a checked out item.
func PatchReturnCheckout(w http.ResponseWriter, r *http.Request) {
	var payload CheckoutQueryPayload
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&payload)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	query := &db.Checkout{
		BookID:   payload.BookID,
		MemberID: payload.MemberID,
	}

	var checkout db.Checkout
	db.MySQL.Model(query).
		Update("returned", time.Now())
	db.MySQL.Model(query).
		Where("book_id = ?", payload.BookID).
		First(&checkout)
	json.NewEncoder(w).Encode(CheckoutResponse{
		Data: checkout,
	})
}

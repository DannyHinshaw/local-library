package handlers

import (
	"encoding/json"
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

// queryCheckoutWithParamBookID - Build gorm book query with id from url params.
func queryCheckoutWithParamBookID(r *http.Request) (*db.Checkout, error) {
	params := mux.Vars(r)
	bookId := params["book_id"]
	if bookId == "" {
		return nil, errorBookISBN
	}

	id := StringToUInt(bookId)
	query := &db.Checkout{BookID: id}

	return query, nil
}

// queryCheckoutWithParamBookID - Build gorm book query with id from url params.
func queryCheckoutWithParamMemberID(r *http.Request) (*db.Checkout, error) {
	params := mux.Vars(r)
	memberId := params["member_id"]
	if memberId == "" {
		return nil, errorBookISBN
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

	db.MySQL.Create(&checkout)
	json.NewEncoder(w).Encode(CheckoutResponse{
		Data: checkout,
	})
}

// PatchUpdateCheckout - Updates a checked out item.
func PatchUpdateCheckout(w http.ResponseWriter, r *http.Request) {
	var requestCheckout db.Checkout
	query, err := queryCheckoutWithParamBookID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	// Parse request body json.
	decoder := json.NewDecoder(r.Body)
	errJSON := decoder.Decode(&requestCheckout)
	if errJSON != nil {
		HandleErrorResponse(w, errJSON, http.StatusBadRequest)
		return
	}

	// Update only what's supplied
	updates := map[string]interface{}{}
	if requestCheckout.Returned != nil {
		updates["returned"] = time.Now()
	}

	checkoutQuery := &db.Checkout{
		MemberID: requestCheckout.MemberID,
		BookID:   query.BookID,
	}

	var newCheckout db.Checkout
	db.MySQL.Model(checkoutQuery).Updates(updates)
	db.MySQL.Model(checkoutQuery).First(&newCheckout)
	json.NewEncoder(w).Encode(CheckoutResponse{
		Data: newCheckout,
	})
}

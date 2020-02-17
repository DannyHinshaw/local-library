package handlers

import (
	"encoding/json"
	"errors"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	gormbulk "github.com/t-tiger/gorm-bulk-insert"
	"log"
	"main/db"
	"net/http"
	"time"
)

type PostCheckouts struct {
	MemberID uuid.UUID `json:"member_id"`
	BookIDs  []uint    `json:"book_ids"`
}

type CheckoutResponse struct {
	Data db.Checkout `json:"data"`
}

type CheckoutsResponse struct {
	Data []db.Checkout `json:"data"`
}

type CheckoutsResponseInterface struct {
	Data []interface{} `json:"data"`
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

// PostNewCheckouts - Checkout a multiple books for a member.
func PostNewCheckouts(w http.ResponseWriter, r *http.Request) {
	var postCheckouts PostCheckouts
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&postCheckouts)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var checkouts []interface{}
	for _, bookId := range postCheckouts.BookIDs {
		newCheckout := db.Checkout{
			BookID:     bookId,
			MemberID:   postCheckouts.MemberID,
			CheckedOut: time.Now(),
		}
		checkouts = append(checkouts, newCheckout)
	}

	errBulkCheckouts := gormbulk.BulkInsert(db.MySQL, checkouts, 3000)
	if errBulkCheckouts != nil {
		log.Println(errBulkCheckouts.Error())
		return
	}
	json.NewEncoder(w).Encode(CheckoutsResponseInterface{
		Data: checkouts,
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

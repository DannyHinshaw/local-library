package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	"main/db"
	"net/http"
	"time"
)

type MembersResponse struct {
	Data []db.Member `json:"data"`
}

type MemberResponse struct {
	Data db.Member `json:"data"`
}

// Common request errors
var errorMemberID = errors.New("member_id id missing in request")

// queryMemberWithParamsMemberID - Build gorm book query with id from url params.
func queryMemberWithParamsMemberID(r *http.Request) (*db.Member, error) {
	params := mux.Vars(r)
	memberID := params["id"]
	if memberID == "" {
		return nil, errorMemberID
	}

	mID := uuid.FromStringOrNil(memberID)
	query := &db.Member{Person: db.Person{
		ID: mID,
	}}

	return query, nil
}

// GetAllMembers - Get all library members.
func GetAllMembers(w http.ResponseWriter, r *http.Request) {
	var allMembers []db.Member
	queryParams := r.URL.Query()
	checkouts := queryParams.Get("checkouts")
	if checkouts != "" {
		db.MySQL.
			Preload("Checkouts", "`checkouts`.`returned` IS NULL").
			Find(&allMembers)
	} else {
		db.MySQL.Find(&allMembers)
	}

	json.NewEncoder(w).Encode(MembersResponse{
		Data: allMembers,
	})
}

// GetMemberByID - Get a member by their ID.
func GetMemberByID(w http.ResponseWriter, r *http.Request) {
	query, err := queryMemberWithParamsMemberID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	var member db.Member
	db.MySQL.Unscoped().Where(query).First(&member)
	if member.DeletedAt != nil {
		json.NewEncoder(w).Encode(EmptyItemResponse{})
		return
	}

	json.NewEncoder(w).Encode(MemberResponse{
		Data: member,
	})
}

// PostNewMember - Create a new library member.
func PostNewMember(w http.ResponseWriter, r *http.Request) {
	var member db.Member
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&member)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	member.ID = uuid.NewV4()
	db.MySQL.Create(&member)
	json.NewEncoder(w).Encode(MemberResponse{
		Data: member,
	})
}

// PatchUpdateMember - Update to members data.
func PatchUpdateMember(w http.ResponseWriter, r *http.Request) {
	query, errQ := queryMemberWithParamsMemberID(r)
	if errQ != nil {
		HandleErrorResponse(w, errQ, http.StatusBadRequest)
		return
	}

	// Parse request body json.
	var member db.Member
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&member)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	queryMemberByID := db.Member{
		Person: db.Person{
			ID: query.ID,
		},
	}

	// Check the members current state from db and handle errors.
	var currentMember db.Member
	db.MySQL.Unscoped().Where(queryMemberByID).First(&currentMember)
	if currentMember.DeletedAt != nil || IsInvalidPerson(currentMember.Person) {
		msg := fmt.Sprintf("no member with id %s found", query.ID)
		err := errors.New(msg)
		HandleErrorResponse(w, err, http.StatusNotFound)
		return
	}

	// Update only what's supplied
	updates := map[string]interface{}{}
	if member.ImageURL != "" {
		updates["image_url"] = member.ImageURL
	}
	if member.FirstName != "" {
		updates["first_name"] = member.FirstName
	}
	if member.LastName != "" {
		updates["last_name"] = member.LastName
	}
	if member.Middle != "" {
		updates["middle"] = member.Middle
	}

	// Apply updates to member.
	member.ID = query.ID
	updates["updated_at"] = time.Now()
	db.MySQL.Model(&member).Updates(updates)

	// Get the updated member object to return.
	var updatedMember db.Member
	db.MySQL.Where(query).First(&updatedMember)
	json.NewEncoder(w).Encode(MemberResponse{
		Data: updatedMember,
	})
}

// DeleteMemberByID - Deletes an member record by their uuid.
func DeleteMemberByID(w http.ResponseWriter, r *http.Request) {
	var member db.Member
	query, err := queryMemberWithParamsMemberID(r)
	if err != nil {
		HandleErrorResponse(w, err, http.StatusBadRequest)
		return
	}

	db.MySQL.Where(query).Delete(&member)
}

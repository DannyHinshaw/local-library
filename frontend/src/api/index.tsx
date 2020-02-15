/* =======================================================
 *					        Utility Functions
======================================================= */

export const baseUrl: string = "http://localhost:8000";


/* =======================================================
 *					Endpoint Handlers
======================================================= */


/* 				  Utility Handlers
============================================== */

const getHealthCheck = () => {
	return fetch(`${baseUrl}/health`);
};

const getSeedDatabase = () => {
	return fetch(`${baseUrl}/seed`);
};


/* 				  Authors Handlers
============================================== */

const getAllAuthors = () => {
	return fetch(`${baseUrl}/authors`)
		.then(res => res.json());
};

const getAuthorByID = (id: string) => {
	return fetch(`${baseUrl}/authors/${id}`)
		.then(res => res.json());
};

/* 				  Books Handlers
============================================== */

const getAllBooks = () => {
	return fetch(`${baseUrl}/books`)
		.then(res => res.json());
};

const getBookByISBN = (isbn: string) => {
	return fetch(`${baseUrl}/books/${isbn}`)
		.then(res => res.json());
};

/* 				  Checkout Handlers
============================================== */

const getAllCheckouts = () => {
	return fetch(`${baseUrl}/checkouts`)
		.then(res => res.json());
};

/* 				  Events Handlers
============================================== */

const getAllEvents = () => {
	return fetch(`${baseUrl}/events`)
		.then(res => res.json());
};

/* 				  Members Handlers
============================================== */

const getAllMembers = () => {
	return fetch(`${baseUrl}/members`)
		.then(res => res.json());
};

const getMemberByID = (id: string) => {
	return fetch(`${baseUrl}/members/${id}`)
		.then(res => res.json());
};


export interface IAPI {

	// Util
	getHealthCheck: typeof getHealthCheck
	getSeedDatabase: typeof getSeedDatabase

	// Books
	getAllAuthors: typeof getAllAuthors
	getAuthorByID: typeof getAuthorByID

	// Books
	getAllBooks: typeof getAllBooks
	getBookByISBN: typeof getBookByISBN

	// Checkouts
	getAllCheckouts: typeof getAllCheckouts

	// Members
	getAllMembers: typeof getAllMembers
	getMemberByID: typeof getMemberByID
}

export const api: IAPI = {

	// Util
	getHealthCheck,
	getSeedDatabase,

	// Books
	getAllAuthors,
	getAuthorByID,

	// Books
	getAllBooks,
	getBookByISBN,

	// Checkouts
	getAllCheckouts,

	// Members
	getAllMembers,
	getMemberByID
};

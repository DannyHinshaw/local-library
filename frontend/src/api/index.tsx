/* =======================================================
 *					        Config/Types
======================================================= */

export interface IBookPayloadBase {
	isbn: string // Required by all book endpoints
}

export interface IPatchUpdateBookPayload extends IBookPayloadBase {
	description?: string
	author_ids?: string[]
	image_url?: string
	title?: string
}

export interface IPostNewBookPayload extends IBookPayloadBase {
	description: string
	author_ids: string[]
	image_url: string
	copies: number
	title: string
	isbn: string // Required by endpoint
}

export interface IMemberActionBase {
	member_id: string
}

export interface IPostNewCheckoutsPayload extends IMemberActionBase {
	isbns: string[]
}

export interface IPatchReturnCheckout extends IMemberActionBase {
	book_id: number
}

export const baseUrl: string = "http://localhost:8000";

/* =======================================================
 *					        Utility Functions
======================================================= */


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

const patchUpdateBookByISBN = (payload: IPatchUpdateBookPayload) => {
	const { isbn } = payload;
	return fetch(`${baseUrl}/books/${isbn}`, {
		method: "PATCH",
		body: JSON.stringify(payload)
	});
};

const deleteBookByISBN = (isbn: string) => {
	return fetch(`${baseUrl}/books/${isbn}`, {
		method: "DELETE"
	});
};

const postNewBook = (payload: IPostNewBookPayload) => {
	return fetch(`${baseUrl}/books`, {
		method: "POST",
		body: JSON.stringify(payload)
	});
};


/* 				  Checkout Handlers
============================================== */

const getAllCheckouts = () => {
	return fetch(`${baseUrl}/checkouts`)
		.then(res => res.json());
};

const getCheckoutsByMemberID = (id: string) => {
	return fetch(`${baseUrl}/checkouts/${id}`)
		.then(res => res.json());
};

const postNewCheckouts = (payload: IPostNewCheckoutsPayload) => {
	return fetch(`${baseUrl}/checkouts`, {
		method: "POST",
		body: JSON.stringify(payload)
	});
};

const patchReturnCheckout = (payload: IPatchReturnCheckout) => {
	return fetch(`${baseUrl}/checkouts`, {
		method: "PATCH",
		body: JSON.stringify(payload)
	});
};

/* 				  Events Handlers
============================================== */

const getAllEvents = () => {
	return fetch(`${baseUrl}/events`)
		.then(res => res.json());
};

const getEventsByBookISBN = (isbn: string) => {
	return fetch(`${baseUrl}/events/books/${isbn}`)
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
	postNewBook: typeof postNewBook
	getBookByISBN: typeof getBookByISBN
	deleteBookByISBN: typeof deleteBookByISBN
	patchUpdateBookByISBN: typeof patchUpdateBookByISBN

	// Checkouts
	getAllCheckouts: typeof getAllCheckouts
	getCheckoutsByMemberID: typeof getCheckoutsByMemberID
	postNewCheckouts: typeof postNewCheckouts
	patchReturnCheckout: typeof patchReturnCheckout

	// Events
	getAllEvents: typeof getAllEvents
	getEventsByBookISBN: typeof getEventsByBookISBN

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
	postNewBook,
	getBookByISBN,
	deleteBookByISBN,
	patchUpdateBookByISBN,

	// Checkouts
	getAllCheckouts,
	getCheckoutsByMemberID,
	postNewCheckouts,
	patchReturnCheckout,

	// Events
	getAllEvents,
	getEventsByBookISBN,

	// Members
	getAllMembers,
	getMemberByID
};

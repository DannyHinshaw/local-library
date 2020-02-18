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

export interface IPostAuthorPayload {
	first_name: string
	last_name: string
	middle: string
}

export interface IPostNewMemberPayload extends IPostAuthorPayload {
	image_url: string
}

export const API_BASE_URL: string = "http://localhost:8000/api";


/* =======================================================
 *					        Utility Functions
======================================================= */


/* =======================================================
 *					Endpoint Handlers
======================================================= */


/* 				  Utility Handlers
============================================== */

const getHealthCheck = () => {
	return fetch(`${API_BASE_URL}/health`);
};

const getSeedDatabase = () => {
	return fetch(`${API_BASE_URL}/seed`);
};


/* 				  Authors Handlers
============================================== */

const getAllAuthors = () => {
	return fetch(`${API_BASE_URL}/authors?books=true`)
		.then(res => res.json());
};

const getAuthorByID = (id: string) => {
	return fetch(`${API_BASE_URL}/authors/${id}`)
		.then(res => res.json());
};

const postCreateNewAuthor = (author: IPostAuthorPayload) => {
	return fetch(`${API_BASE_URL}/authors`, {
		method: "POST",
		body: JSON.stringify(author)
	});
};


/* 				  Books Handlers
============================================== */

const getAllBooks = () => {
	return fetch(`${API_BASE_URL}/books`)
		.then(res => res.json());
};

const getBookByISBN = (isbn: string) => {
	return fetch(`${API_BASE_URL}/books/${isbn}`)
		.then(res => res.json());
};

const patchUpdateBookByISBN = (payload: IPatchUpdateBookPayload) => {
	const { isbn } = payload;
	return fetch(`${API_BASE_URL}/books/${isbn}`, {
		method: "PATCH",
		body: JSON.stringify(payload)
	});
};

const deleteBookByISBN = (isbn: string) => {
	return fetch(`${API_BASE_URL}/books/${isbn}`, {
		method: "DELETE"
	});
};

const postNewBook = (payload: IPostNewBookPayload) => {
	return fetch(`${API_BASE_URL}/books`, {
		method: "POST",
		body: JSON.stringify(payload)
	});
};


/* 				  Checkout Handlers
============================================== */

const getAllCheckouts = () => {
	return fetch(`${API_BASE_URL}/checkouts`)
		.then(res => res.json());
};

const getCheckoutsByMemberID = (id: string) => {
	return fetch(`${API_BASE_URL}/checkouts/${id}`)
		.then(res => res.json());
};

const postNewCheckouts = (payload: IPostNewCheckoutsPayload) => {
	return fetch(`${API_BASE_URL}/checkouts`, {
		method: "POST",
		body: JSON.stringify(payload)
	});
};

const patchReturnCheckout = (payload: IPatchReturnCheckout) => {
	return fetch(`${API_BASE_URL}/checkouts`, {
		method: "PATCH",
		body: JSON.stringify(payload)
	});
};


/* 				  Events Handlers
============================================== */

const getAllEvents = () => {
	return fetch(`${API_BASE_URL}/events`)
		.then(res => res.json());
};

const getEventsByBookISBN = (isbn: string) => {
	return fetch(`${API_BASE_URL}/events/books/${isbn}`)
		.then(res => res.json());
};


/* 				  Members Handlers
============================================== */

const getAllMembers = () => {
	return fetch(`${API_BASE_URL}/members`)
		.then(res => res.json());
};

const getMemberByID = (id: string) => {
	return fetch(`${API_BASE_URL}/members/${id}`)
		.then(res => res.json());
};

const postCreateNewMember = (member: IPostNewMemberPayload) => {
	return fetch(`${API_BASE_URL}/members`, {
		method: "POST",
		body: JSON.stringify(member)
	});
};


export interface IAPI {

	// Util
	getHealthCheck: typeof getHealthCheck
	getSeedDatabase: typeof getSeedDatabase

	// Authors
	getAllAuthors: typeof getAllAuthors
	getAuthorByID: typeof getAuthorByID
	postCreateNewAuthor: typeof postCreateNewAuthor

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
	postCreateNewMember: typeof postCreateNewMember
}

export const api: IAPI = {

	// Util
	getHealthCheck,
	getSeedDatabase,

	// Authors
	getAllAuthors,
	getAuthorByID,
	postCreateNewAuthor,

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
	getMemberByID,
	postCreateNewMember
};

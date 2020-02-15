import { Dispatch, SetStateAction } from "react";

export type StateSetter<T> = Dispatch<SetStateAction<T>>;
export type OrNull<T> = T | null;

export enum BookEventType {
	CREATE = "CREATE",
	DELETE = "DELETE",
	UPDATE = "UPDATE"
}

export interface IBase {
	created_at: string
	updated_at: string
}

export interface IBookCopy {
	book_id: number
	isbn: string
}

export interface ICheckout extends IBase {
	checked_out: string
	returned: string
	member_id: string
	book_id: number
}

export interface IPerson extends IBase {
	first_name: string
	last_name: string
	middle: string
	id: string
}

export interface IMembers extends IPerson {
	checkouts: ICheckout[]
}

export interface IAuthor extends IPerson {
	books: IBook[]
}

export interface IBookBase extends IBase {
	description: string
	image_url: string
	title: string
}

export interface IBook extends IBookBase {
	description: string
	authors: IAuthor[]
	copies: IBookCopy[]
	title: string
	isbn: string
}

export interface IEvent extends IBookBase {
	event_type: BookEventType
	isbn: string
	id: number
}

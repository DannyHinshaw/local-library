import { action } from "typesafe-actions";
import { AuthorsState } from "../reducers/authorsReducer";
import { BookState } from "../reducers/booksReducer";
import * as actionTypes from "./types";


/*                      Define TypeSafe Actions
 ===================================================================== */


export interface IActionBase {
	type: string
}

export interface IAuthorsAction extends IActionBase {
	payload: AuthorsState
}

export interface IBooksAction extends IActionBase {
	payload: BookState
}


/*      Authors
 ======================= */

export const exampleSet = (payload: AuthorsState): IAuthorsAction =>
	action(actionTypes.AUTHORS_SET, payload);

/*      Books
 ======================= */

export const booksSet = (payload: BookState): IBooksAction =>
	action(actionTypes.BOOKS_SET, payload);


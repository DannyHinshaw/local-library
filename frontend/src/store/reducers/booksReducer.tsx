import { IBook } from "../../types";
import { IBooksAction } from "../actions";
import { BOOKS_SET } from "../actions/types";
import { createReducer } from "../util";


export type BookState = IBook[]
export const initialBookState: BookState = [];

/**
 * Set or reset the books array.
 * @param {BookState} state
 * @param {IBooksAction} action
 * @returns {BookState}
 */
const booksSet = (state: BookState, action: IBooksAction): BookState => action.payload;

/**
 * Main reducer mapping.
 */
export default createReducer(initialBookState, {
	[BOOKS_SET]: booksSet
});


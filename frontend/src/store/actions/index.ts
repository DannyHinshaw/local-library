import { action } from "typesafe-actions";
import { AuthorsState } from "../reducers/authorsReducer";
import { BookState } from "../reducers/booksReducer";
import { CheckoutsState } from "../reducers/checkoutsReducer";
import { MembersState } from "../reducers/membersReducer";
import * as actionTypes from "./types";


/*                      Define TypeSafe Actions
 ===================================================================== */


export interface IActionBase {
	type: string
}

export interface IBooleanAction extends IActionBase {
	payload: boolean
}

export interface IAuthorsAction extends IActionBase {
	payload: AuthorsState
}

export interface IBooksAction extends IActionBase {
	payload: BookState
}

export interface IMembersAction extends IActionBase {
	payload: MembersState
}

export interface ICheckoutAction extends IActionBase {
	payload: CheckoutsState
}


/*      Authors
 ======================= */

export const authorsSet = (payload: AuthorsState): IAuthorsAction =>
	action(actionTypes.AUTHORS_SET, payload);

/*      Books
 ======================= */

export const booksSet = (payload: BookState): IBooksAction =>
	action(actionTypes.BOOKS_SET, payload);

/*      Checkouts
 ======================= */

export const checkoutsSet = (payload: CheckoutsState): ICheckoutAction =>
	action(actionTypes.CHECKOUTS_SET, payload);

/*      Members
 ======================= */

export const membersSet = (payload: MembersState): IMembersAction =>
	action(actionTypes.MEMBERS_SET, payload);

import { IAuthor } from "../../types";
import { IAuthorsAction } from "../actions";
import { AUTHORS_SET } from "../actions/types";
import { createReducer } from "../util";


export type AuthorsState = IAuthor[]
export const initialAuthorState: AuthorsState = [];

const authorsSetReducer = (state: AuthorsState, action: IAuthorsAction): AuthorsState => action.payload;
/**
 * Main reducer mapping.
 */
export default createReducer(initialAuthorState, {
	[AUTHORS_SET]: authorsSetReducer
});


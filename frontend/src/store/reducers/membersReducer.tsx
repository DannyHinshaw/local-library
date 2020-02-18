import { IMember } from "../../types";
import { IMembersAction } from "../actions";
import { MEMBERS_SET } from "../actions/types";
import { createReducer } from "../util";


export type MembersState = IMember[]
export const initialMembersState: MembersState = [];

/**
 * Set the state of the library members list.
 * @param {MembersState} state
 * @param {IMembersAction} action
 * @returns {MembersState}
 */
const membersSetReducer = (state: MembersState, action: IMembersAction): MembersState => action.payload;

/**
 * Main reducer mapping.
 */
export default createReducer(initialMembersState, {
	[MEMBERS_SET]: membersSetReducer
});


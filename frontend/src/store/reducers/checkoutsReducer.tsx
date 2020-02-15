import { ICheckout } from "../../types";
import { IBooksAction, ICheckoutAction } from "../actions";
import { CHECKOUTS_SET } from "../actions/types";
import { createReducer } from "../util";


export type CheckoutsState = ICheckout[]
export const initialCheckoutState: CheckoutsState = [];

/**
 * Set or reset the checkouts array.
 * @param {CheckoutsState} state
 * @param {IBooksAction} action
 * @returns {CheckoutsState}
 */
const checkoutsSet = (state: CheckoutsState, action: ICheckoutAction): CheckoutsState => action.payload;

/**
 * Main reducer mapping.
 */
export default createReducer(initialCheckoutState, {
	[CHECKOUTS_SET]: checkoutsSet
});


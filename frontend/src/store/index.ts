import { applyMiddleware, combineReducers, createStore, Reducer, StoreEnhancer } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistReducer, persistStore } from "redux-persist";
import { PersistConfig } from "redux-persist/es/types";
import storageSession from "redux-persist/lib/storage";
import reduxThunk from "redux-thunk";
import authorsReducer from "./reducers/authorsReducer";
import booksReducer from "./reducers/booksReducer";
import checkoutsReducer from "./reducers/checkoutsReducer";


// Persist store to session storage for refresh
const persistConfig: PersistConfig<any> = {
	key: "root",
	storage: storageSession,
	blacklist: [
		"checkouts",
		"authors",
		"books"
	]
};

/**
 * ===== REGISTER REDUCERS HERE ===== *
 * Main reducer object to define store.
 * @type {Reducer<any>}
 */
const rootReducer: Reducer = combineReducers({
	checkouts: checkoutsReducer,
	authors: authorsReducer,
	books: booksReducer
});

// Create store with reducers, initial state and any middleware.
const middleware: StoreEnhancer = composeWithDevTools(applyMiddleware(reduxThunk));
// const middleware: StoreEnhancer = composeWithDevTools(applyMiddleware(logger, reduxThunk));

// export const store: Store = createStore(rootReducer, middleware);
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer, middleware);
export const persistor = persistStore(store);

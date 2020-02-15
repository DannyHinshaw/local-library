import React, { ComponentType } from "react";
import "./App.css";
import NavDrawer from "./components/NavDrawer";

// App Views
export enum AppView {
	BOOKS = 1,
	AUTHORS = 2,
	MEMBERS = 3
}

/**
 * Main Application container and view controller.
 * @returns {JSX.Element}
 * @constructor
 */
const App: ComponentType = (): JSX.Element => {
	return (
		<NavDrawer />
	);
};

export default App;

import React, { ComponentType } from "react";
import "./App.css";
import Header from "./components/Header";
import Main from "./containers/Main";

/**
 * Main Application.
 * @returns {JSX.Element}
 * @constructor
 */
const App: ComponentType = (): JSX.Element => {
	return (
		<>
			<Header />
			<Main />
		</>
	);
};

export default App;

import React from "react";
import ReactDOM from "react-dom";
import MetaTags from "react-meta-tags";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { persistor, store } from "./store";


ReactDOM.render((
	<>
		<div className="wrapper">
			<MetaTags>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
			</MetaTags>
		</div>

		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</>
), document.getElementById("root"));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

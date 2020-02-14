import React, { ComponentType } from "react";
import CardsView from "../CardsView";
import ControlButtons from "../ControlButtons";
import "./styles.scss";


/**
 * Application main view.
 * @returns {JSX.Element}
 * @constructor
 */
const Main: ComponentType = (): JSX.Element => {

	// Controls switching author or books view.
	const [view, setView] = React.useState(1);

	return (
		<main>
			<ControlButtons setView={setView} view={view} />
			<CardsView />
		</main>
	);
};

export default Main;

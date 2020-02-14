import React, { ComponentType, useEffect } from "react";
import { api } from "../../api";


/**
 * View/layout container for author/book cards lists.
 * @returns {JSX.Element}
 * @constructor
 */
const CardsView: ComponentType = (): JSX.Element => {
	useEffect(() => {
		api.getAllBooks().then(res => {
			console.log("OHHHH YEAAAAAA:::::", res);
		}).catch(console.error);
	}, []);

	return (
		<div>
			CARDS VIEW
		</div>
	);
};

export default CardsView;

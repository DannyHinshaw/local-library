import React, { ComponentType, useEffect } from "react";
import { connect } from "react-redux";
import { api } from "../../api";
import { authorsSet, booksSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";
import { BookState } from "../../store/reducers/booksReducer";


export interface ICardsView {
	authorsSet: typeof authorsSet
	booksSet: typeof booksSet
	authors: AuthorsState
	books: BookState
	view: number
}

/**
 * View/layout container for author/book cards lists.
 * @param {ICardsView} props
 * @returns {JSX.Element}
 * @constructor
 */
const CardsView: ComponentType<ICardsView> = (props: ICardsView): JSX.Element => {
	console.log("props::", props);

	const handleAuthorData = (data: any[]) => {
		const authors = data as AuthorsState;
		props.authorsSet(authors);
	};

	const handleBookData = (data: any[]) => {
		const books = data as BookState;
		props.booksSet(books);
	};

	const viewHandler = (data: any[]) => {
		return props.view === 1
			? handleBookData(data)
			: handleAuthorData(data);
	};

	const getViewData = props.view === 1
		? api.getAllBooks
		: api.getAllAuthors;

	useEffect(() => {
		getViewData().then(res => {
			if (res.data.length) {
				return viewHandler(res.data);
			}

			// Seed the database if there's no test data yet.
			api.getSeedDatabase()
				.then(console.log)
				.catch(console.error);

			console.log("res::", res);
		}).catch(console.error);
	}, [props.view]);

	return (
		<div>
			CARDS VIEW
		</div>
	);
};

const mapStateToProps = ({ authors, books }) => ({ authors, books });
export default connect(mapStateToProps, {
	authorsSet,
	booksSet
})(CardsView);

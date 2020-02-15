import React, { ComponentType, useEffect } from "react";
import { connect } from "react-redux";
import { api } from "../../api";
import { authorsSet, booksSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";
import { BookState } from "../../store/reducers/booksReducer";


export interface IBooksView {
	authorsSet: typeof authorsSet
	booksSet: typeof booksSet
	authors: AuthorsState
	books: BookState
}

/**
 * View/layout container for author/book cards lists.
 * @param {IBooksView} props
 * @returns {JSX.Element}
 * @constructor
 */
const BooksView: ComponentType<IBooksView> = (props: IBooksView): JSX.Element => {

	const handleBookData = (data: any[]) => {
		const books = data as BookState;
		props.booksSet(books);
	};

	useEffect(() => {
		api.getAllBooks().then(res => {
			if (res.data.length) {
				return handleBookData(res.data);
			}

			// Seed the database if there's no test data yet.
			api.getSeedDatabase()
				.then(console.log)
				.catch(console.error);

			console.log("res::", res);
		}).catch(console.error);
	}, []);

	return (
		<div>
			BOOKS VIEW
		</div>
	);
};

const mapStateToProps = ({ authors, books }) => ({ authors, books });
export default connect(mapStateToProps, {
	authorsSet,
	booksSet
})(BooksView);

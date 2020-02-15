import React, { ComponentType, useEffect } from "react";
import Masonry from "react-masonry-css";
import { connect } from "react-redux";
import { api } from "../../api";
import BookCard from "../../components/BookCard";
import { booksSet } from "../../store/actions";
import { BookState } from "../../store/reducers/booksReducer";
import { IBook } from "../../types";
import "./styles.scss";


const breakpointColumnsObj = {
	default: 4,
	900: 3,
	700: 2,
	500: 1
};

export interface IBooksView {
	booksSet: typeof booksSet
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
		<Masonry
			className="my-masonry-grid"
			breakpointCols={breakpointColumnsObj}
			columnClassName="my-masonry-grid_column">
			{props.books.sort(function(a, b) {
				return a.title.localeCompare(b.title);
			}).map((book: IBook, i: number) => {
				return <BookCard book={book} key={i} />;
			})}
		</Masonry>
	);
};

const mapStateToProps = ({ books }) => ({ books });
export default connect(mapStateToProps, {
	booksSet
})(BooksView);

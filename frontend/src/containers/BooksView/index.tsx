import React, { ComponentType, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { connect } from "react-redux";
import { api } from "../../api";
import BookCard from "../../components/BookCard";
import LoaderCircle from "../../components/LoaderCircle";
import { booksSet, checkoutsSet } from "../../store/actions";
import { BookState } from "../../store/reducers/booksReducer";
import { CheckoutsState } from "../../store/reducers/checkoutsReducer";
import { IBook, OrNull } from "../../types";
import "./styles.scss";


const breakpointColumnsObj = {
	default: 4,
	900: 3,
	700: 2,
	500: 1
};

export interface IBooksView {
	checkoutsSet: typeof checkoutsSet
	booksSet: typeof booksSet
	checkouts: CheckoutsState
	books: BookState
}

/**
 * View/layout container for author/book cards lists.
 * @param {IBooksView} props
 * @returns {JSX.Element}
 * @constructor
 */
const BooksView: ComponentType<IBooksView> = (props: IBooksView): JSX.Element => {
	const [loading, setLoading] = useState(true);
	const stopLoader = () => setLoading(false);

	const handleCheckoutData = (data: any[]) => {
		const checkouts = data as CheckoutsState;
		return props.checkoutsSet(checkouts);
	};

	const handleBookData = (data: any[]) => {
		const books = data as BookState;
		return props.booksSet(books);
	};

	// Retrieve and store checkouts.
	const fetchCheckouts = () => api.getAllCheckouts().then((res): OrNull<any> => {
		return res.data.length
			? handleCheckoutData(res.data)
			: null;
	});

	// Retrieve and store books.
	const fetchBooks = () => api.getAllBooks().then((res): OrNull<any> => {
		return res.data.length
			? handleBookData(res.data)
			: null;
	});

	useEffect(() => {
		if (!props.books.length && !props.checkouts.length) {
			Promise.all([fetchBooks(), fetchCheckouts()]).then((hasData) => {

				// Seed the database if there's no test data yet.
				if (!hasData[0]) {
					return api.getSeedDatabase()
						.then(console.log)
						.then(stopLoader)
						.catch(console.error);
				}

				return stopLoader();
			}).catch(console.error);
		} else {
			stopLoader();
		}
	}, []);


	return loading
		? <LoaderCircle size={100} />
		: <Masonry
			className="my-masonry-grid"
			breakpointCols={breakpointColumnsObj}
			columnClassName="my-masonry-grid_column">
			{props.books.sort(function(a, b) {
				return a.title.localeCompare(b.title);
			}).map((book: IBook, i: number) => {
				return <BookCard book={book} key={i} />;
			})}
		</Masonry>;
};

const mapStateToProps = ({ books, checkouts }) => ({ books, checkouts });
export default connect(mapStateToProps, {
	checkoutsSet,
	booksSet
})(BooksView);

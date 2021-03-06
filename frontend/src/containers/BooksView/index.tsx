import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import GetAppOutlinedIcon from "@material-ui/icons/GetAppOutlined";
import { Parser } from "json2csv";
import React, { ComponentType, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { connect } from "react-redux";
import { api } from "../../api";
import BookCard from "../../components/BookCard";
import BookCreateDialog from "../../components/BookCreateDialog";
import LoaderCircle from "../../components/LoaderCircle";
import { authorsSet, booksSet, checkoutsSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";
import { BookState } from "../../store/reducers/booksReducer";
import { CheckoutsState } from "../../store/reducers/checkoutsReducer";
import { IAuthor, IBook, IBookCopy, ICheckout, OrNull } from "../../types";
import { getPersonName } from "../../util/data";
import "./styles.scss";

const breakpointColumnsObj = {
	default: 4,
	900: 3,
	700: 2,
	500: 1
};

export interface IBookReport {
	ISBN: string
	Title: string
	Authors: string
	Description: string
	TotalCopies: number
	CopiesCheckedOut: number
}

export interface IBooksView {
	checkoutsSet: typeof checkoutsSet
	authorsSet: typeof authorsSet
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
	const [refresh, setRefresh] = useState(false);
	const [openCreateDialog, setOpenCreateDialog] = useState(false);

	const stopLoader = () => setLoading(false);

	const handleClickCreateDialog = () =>
		setOpenCreateDialog(!openCreateDialog);

	const handleCheckoutData = (data: any[]) => {
		const checkouts = data as CheckoutsState;
		return props.checkoutsSet(checkouts);
	};

	const handleAuthorData = (data: any[]) => {
		const authors = data as AuthorsState;
		return props.authorsSet(authors);
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

	// Retrieve and store authors.
	const fetchAuthors = () => api.getAllAuthors().then((res): OrNull<any> => {
		return res.data.length
			? handleAuthorData(res.data)
			: null;
	});

	// Retrieve and store books.
	const fetchBooks = () => api.getAllBooks().then((res): OrNull<any> => {
		return res.data && res.data.length
			? handleBookData(res.data)
			: null;
	});

	useEffect(() => {
		if (refresh || !props.books.length && !props.checkouts.length) {
			Promise.all([
				fetchBooks(),
				fetchAuthors(),
				fetchCheckouts()
			]).then((hasData) => {

				// Seed the database if there's no test data yet.
				if (!hasData[0]) {
					return api.getSeedDatabase()
						.then(console.log)
						.then(() => window.location.reload())
						.catch(console.error);
				}

				return stopLoader();
			}).catch(console.error);
		} else {
			stopLoader();
		}
	}, [refresh]);

	const sortBooksByTitle = (a, b): number => {
		return a.title.localeCompare(b.title);
	};

	const currentlyCheckedOut = props.checkouts.filter((checkout: ICheckout) => {
		return !checkout.returned;
	});

	const numCopiesCheckedOut = (copies: IBookCopy[]) => {
		return copies.reduce((base, copy) => {
			const bookID = copy.id;
			const isCheckedOut = currentlyCheckedOut.some(c => {
				return c.book_id === bookID;
			});

			return isCheckedOut ? base + 1 : base;
		}, 0);
	};

	const renderCards = (): JSX.Element[] => {
		const booksSorted: IBook[] = props.books.sort(sortBooksByTitle);
		return booksSorted.map((book: IBook, i: number) => {
			const numCopies: number = book.copies ? book.copies.length : 0;
			const numCheckedOut = numCopiesCheckedOut(book.copies);
			const available: number = numCopies - numCheckedOut;

			return <BookCard
				totalCopies={numCopies}
				copiesAvailable={available}
				book={book}
				key={i} />;
		});
	};

	const downloadCSV = (csv: string, filename: string) => {
		let csvFile;
		let downloadLink;
		if (window.Blob == undefined || window.URL == undefined || window.URL.createObjectURL == undefined) {
			alert("Your browser doesn't support Blobs");
			return;
		}

		csvFile = new Blob([csv], { type: "text/csv" });
		downloadLink = document.createElement("a");
		downloadLink.download = filename;
		downloadLink.href = window.URL.createObjectURL(csvFile);
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
	};

	const buildReport = () => {
		if (!props.books.length) {
			console.error("No book data to make report.");
			return;
		}

		const allReports = props.books.reduce((reports: IBookReport[], book: IBook) => {
			const authorsCombined = Object.keys(book.authors).reduce((base: string, key: string, i: number) => {
				const author: IAuthor = book.authors[key];
				const name = getPersonName(author);
				if (i > 0) {
					return base.concat(", ", name);
				}
				return name;
			}, "");

			const { aggregates } = book;
			const numCopies = aggregates && aggregates.number_of_copies || 0;
			const numCheckedOut = aggregates && aggregates.number_checked_out || 0;
			return reports.concat({
				ISBN: book.isbn,
				Title: book.title,
				Authors: authorsCombined,
				Description: book.description,
				TotalCopies: numCopies,
				CopiesCheckedOut: numCheckedOut
			});
		}, []);

		const fields = Object.keys(allReports[0]);
		const json2csvParser = new Parser({ fields });
		const csvContent = json2csvParser.parse(allReports);

		const dateString = new Date().toLocaleDateString();
		const fileName = `book-report-${dateString}`;
		downloadCSV(csvContent, fileName);
	};

	return loading
		? <LoaderCircle size={100} />
		: (
			<>
				<div id="bookControlsContainer">
					<Button
						onClick={handleClickCreateDialog}
						startIcon={<AddIcon />}
						variant="contained"
						color="secondary"
						size="large"
					>
						New Book
					</Button>
					<BookCreateDialog
						setRefresh={setRefresh}
						setOpen={setOpenCreateDialog}
						open={openCreateDialog} />
					<Button
						onClick={buildReport}
						startIcon={<GetAppOutlinedIcon />}
						variant="contained"
						color="secondary"
						size="large"
					>
						Report
					</Button>
				</div>
				<br />
				<Masonry
					className="my-masonry-grid"
					breakpointCols={breakpointColumnsObj}
					columnClassName="my-masonry-grid_column">
					{renderCards()}
				</Masonry>
			</>
		);
};

const mapStateToProps = ({ books, checkouts }) =>
	({ books, checkouts });
export default connect(mapStateToProps, {
	checkoutsSet,
	authorsSet,
	booksSet
})(BooksView);

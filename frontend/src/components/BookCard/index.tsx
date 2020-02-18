import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import DeleteForeverIcon from "@material-ui/icons/DeleteForeverOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import History from "@material-ui/icons/HistoryOutlined";
import React, { ComponentType, useEffect, useState } from "react";
import ReactImageFallback from "react-image-fallback";
import { api } from "../../api";
import { store } from "../../store";
import { booksSet } from "../../store/actions";
import { BookState } from "../../store/reducers/booksReducer";
import { IBook, OrNull } from "../../types";
import { getPersonName } from "../../util/data";
import BookDeleteDialog from "../BookDeleteDialog";
import BookEditDialog from "../BookEditDialog";
import BookHistoryDialog from "../BookHistoryDialog";


const useStyles = makeStyles({
	root: {
		maxWidth: 345,
		marginBottom: 24
	},
	media: {
		height: 140,
		textAlign: "center",
		marginBottom: 12,
		padding: 12
	}
});

export interface IBookCardProps {
	copiesAvailable: number
	totalCopies: number
	book: IBook
}

const defaultImageURL = "images/placeholder-book-cover-default.png";
const initialImageURL = "images/image-loading.gif";

/**
 * Information display card for a book.
 * @param {IBookCardProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const BookCard: ComponentType<IBookCardProps> = (props: IBookCardProps): JSX.Element => {
	const classes = useStyles();
	const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [refresh, setRefresh] = useState(false);

	const handleBookData = (data: any[]) => {
		const books = data as BookState;
		return store.dispatch(booksSet(books));
	};

	// Retrieve and store books.
	const fetchBooks = () => api.getAllBooks().then((res): OrNull<any> => {
		return res.data.length
			? handleBookData(res.data)
			: null;
	});

	// List to refresh books data
	useEffect(() => {
		if (refresh) {
			fetchBooks().then(res => {
				console.log("done refreshing");
				setRefresh(false);
			});
		}
	}, [refresh]);

	const handleClickHistory = () =>
		setOpenHistoryDialog(!openHistoryDialog);

	const handleClickEdit = () =>
		setOpenEditDialog(!openEditDialog);

	const handleClickDelete = () =>
		setOpenDeleteDialog(!openDeleteDialog);

	return (
		<Card className={classes.root}>
			<CardActionArea>
				<CardMedia className={classes.media}>
					<ReactImageFallback
						src={props.book.image_url}
						fallbackImage={defaultImageURL}
						initialImage={initialImageURL}
						style={{ maxHeight: 140 }}
						alt="Book Cover" />
				</CardMedia>
				<CardContent>

					{/* Title */}
					<Typography gutterBottom variant="h5" component="h2">
						{props.book.title}
					</Typography>

					{/* Authors */}
					{props.book.authors.map((a, i) => {
						return (
							<Typography key={i}>
								{getPersonName(a)}
							</Typography>
						);
					})}

					{/* Copies Available */}
					<Typography style={{ margin: ".5rem 0" }} gutterBottom component="p">
						{props.copiesAvailable}/{props.totalCopies} Copies Available
					</Typography>

					{/* Description */}
					<Typography variant="body2" color="textSecondary" component="p">
						{props.book.description}
					</Typography>

				</CardContent>
			</CardActionArea>
			<CardActions style={{ display: "flex", justifyContent: "center" }}>

				{/* Open dialog for book edit history (Events) */}
				<Tooltip title="Edit History">
					<IconButton onClick={handleClickHistory}>
						<History />
					</IconButton>
				</Tooltip>
				<BookHistoryDialog
					setOpen={setOpenHistoryDialog}
					open={openHistoryDialog}
					book={props.book} />

				{/* Open dialog to edit book data */}
				<Tooltip title="Edit">
					<IconButton onClick={handleClickEdit}>
						<EditOutlinedIcon />
					</IconButton>
				</Tooltip>
				<BookEditDialog
					setRefresh={setRefresh}
					setOpen={setOpenEditDialog}
					open={openEditDialog}
					book={props.book} />

				{/* Open dialog to delete book */}
				<Tooltip title="Delete">
					<IconButton onClick={handleClickDelete}>
						<DeleteForeverIcon />
					</IconButton>
				</Tooltip>
				<BookDeleteDialog
					setRefresh={setRefresh}
					setOpen={setOpenDeleteDialog}
					open={openDeleteDialog}
					book={props.book} />

			</CardActions>
		</Card>
	);
};

export default BookCard;

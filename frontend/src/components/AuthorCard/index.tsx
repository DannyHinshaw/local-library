import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { ComponentType, useEffect, useState } from "react";
import { api } from "../../api";
import { store } from "../../store";
import { authorsSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";
import { IAuthor, IBook, OrNull } from "../../types";
import { getPersonName } from "../../util/data";


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

export interface IAuthorCardProps {
	author: IAuthor
}

const defaultImageURL = "images/avatar-placeholder.png";
const initialImageURL = "images/image-loading.gif";

/**
 * Information display card for a library member.
 * @param {IAuthorCardProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const AuthorCard: ComponentType<IAuthorCardProps> = (props: IAuthorCardProps): JSX.Element => {
	const classes = useStyles();
	const authorBooks: IBook[] = props.author.books;
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [refresh, setRefresh] = useState(false);

	const handleAuthorsData = (data: any[]) => {
		const members = data as AuthorsState;
		return store.dispatch(authorsSet(members));
	};

	// Retrieve and store books.
	const fetchAuthors = () => api.getAllAuthors().then((res): OrNull<any> => {
		return res.data.length
			? handleAuthorsData(res.data)
			: null;
	});

	// List to refresh books data
	useEffect(() => {
		if (refresh) {
			fetchAuthors().then(res => {
				setRefresh(false);
			}).catch(console.error);
		}
	}, [refresh]);

	const handleClickEdit = () =>
		setOpenEditDialog(!openEditDialog);

	const handleClickDelete = () =>
		setOpenDeleteDialog(!openDeleteDialog);

	const numBooks = authorBooks ? authorBooks.length : 0;
	const isBooksPlural = numBooks === 0 || numBooks > 1;
	return (
		<Card className={classes.root}>
			<CardActionArea>
				<CardContent>

					{/* Author Name */}
					<Typography gutterBottom variant="h5" component="h2" style={{ textAlign: "center" }}>
						{getPersonName(props.author)}
					</Typography>

					{/* Author Name */}
					<Typography gutterBottom component="p" style={{ textAlign: "center" }}>
						{numBooks} Book{isBooksPlural ? "s" : ""} in Library
					</Typography>

				</CardContent>
			</CardActionArea>
			{/*<CardActions style={{ display: "flex", justifyContent: "center" }}>*/}

			{/* TODO: Author editing if there's time */}
			{/*<Tooltip title="Edit">*/}
			{/*	<>*/}
			{/*		<IconButton onClick={handleClickEdit}>*/}
			{/*			<EditOutlinedIcon />*/}
			{/*		</IconButton>*/}
			{/*		<BookEditDialog*/}
			{/*			setRefresh={setRefresh}*/}
			{/*			setOpen={setOpenEditDialog}*/}
			{/*			open={openEditDialog}*/}
			{/*			book={props.book} />*/}
			{/*	</>*/}
			{/*</Tooltip>*/}

			{/* TODO: Author deleting if there's time */}
			{/*<Tooltip title="Delete">*/}
			{/*	<>*/}
			{/*		<IconButton onClick={handleClickDelete}>*/}
			{/*			<DeleteForeverIcon />*/}
			{/*		</IconButton>*/}
			{/*		<BookDeleteDialog*/}
			{/*			setRefresh={setRefresh}*/}
			{/*			setOpen={setOpenDeleteDialog}*/}
			{/*			open={openDeleteDialog}*/}
			{/*			book={props.book} />*/}
			{/*	</>*/}
			{/*</Tooltip>*/}
			{/*</CardActions>*/}
		</Card>
	);
};

export default AuthorCard;

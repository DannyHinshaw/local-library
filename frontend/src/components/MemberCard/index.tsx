import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import ShoppingCart from "@material-ui/icons/AddShoppingCart";
import History from "@material-ui/icons/HistoryOutlined";
import React, { ComponentType, useEffect, useState } from "react";
import ReactImageFallback from "react-image-fallback";
import { api } from "../../api";
import { store } from "../../store";
import { booksSet, membersSet } from "../../store/actions";
import { BookState } from "../../store/reducers/booksReducer";
import { CheckoutsState } from "../../store/reducers/checkoutsReducer";
import { MembersState } from "../../store/reducers/membersReducer";
import { IMember, OrNull } from "../../types";
import { getPersonName } from "../../util/data";
import MemberCheckoutDialog from "../MemberCheckoutDialog";
import MemberHistoryDialog from "../MemberHistoryDialog";


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

export interface IMemberCardProps {
	checkouts: CheckoutsState
	books: BookState
	member: IMember
}

const defaultImageURL = "images/avatar-placeholder.png";
const initialImageURL = "images/image-loading.gif";

/**
 * Information display card for a library member.
 * @param {IMemberCardProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const MemberCard: ComponentType<IMemberCardProps> = (props: IMemberCardProps): JSX.Element => {
	const classes = useStyles();
	const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
	const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [refresh, setRefresh] = useState(false);

	const handleMembersData = (data: any[]) => {
		const members = data as MembersState;
		return store.dispatch(membersSet(members));
	};

	const handleBookData = (data: any[]) => {
		const books = data as BookState;
		return store.dispatch(booksSet(books));
	};

	// Retrieve and store books.
	const fetchMembers = () => api.getAllMembers().then((res): OrNull<any> => {
		return res.data.length
			? handleBookData(res.data)
			: null;
	});

	// Retrieve and store books.
	const fetchBooks = () => api.getAllBooks().then((res): OrNull<any> => {
		return res.data.length
			? handleBookData(res.data)
			: null;
	});

	// List to refresh books data
	useEffect(() => {
		if (refresh) {
			Promise.resolve([
				fetchMembers(),
				fetchBooks()
			]).then(res => {
				console.log("done refreshing");
				setRefresh(false);
			});
		}
	}, [refresh]);

	const handleClickHistory = () =>
		setOpenHistoryDialog(!openHistoryDialog);

	const handleClickCheckout = () =>
		setOpenCheckoutDialog(!openCheckoutDialog);

	const handleClickEdit = () =>
		setOpenEditDialog(!openEditDialog);

	const handleClickDelete = () =>
		setOpenDeleteDialog(!openDeleteDialog);

	return (
		<Card className={classes.root}>
			<CardActionArea>
				<CardMedia className={classes.media}>
					<ReactImageFallback
						src={props.member.image_url}
						fallbackImage={defaultImageURL}
						initialImage={initialImageURL}
						style={{ maxHeight: 140 }}
						alt="Book Cover" />
				</CardMedia>
				<CardContent>

					{/* Member Name */}
					<Typography gutterBottom variant="h5" component="h2" style={{ textAlign: "center" }}>
						{getPersonName(props.member)}
					</Typography>

				</CardContent>
			</CardActionArea>
			<CardActions style={{ display: "flex", justifyContent: "center" }}>

				{/* Open Dialog for Member Checkout History (Events) */}
				<Tooltip title="Checkouts History">
					<>
						<IconButton onClick={handleClickHistory}>
							<History />
						</IconButton>
						<MemberHistoryDialog
							setOpen={setOpenHistoryDialog}
							open={openHistoryDialog}
							member={props.member} />
					</>
				</Tooltip>

				<Tooltip title="Checkout">
					<>
						<IconButton onClick={handleClickCheckout}>
							<ShoppingCart />
						</IconButton>
						<MemberCheckoutDialog
							setOpen={setOpenCheckoutDialog}
							open={openCheckoutDialog}
							checkouts={props.checkouts}
							member={props.member}
							books={props.books}
						/>
					</>
				</Tooltip>

				{/* TODO: Member editing if there's time */}
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

				{/* TODO: Member deleting if there's time */}
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
			</CardActions>
		</Card>
	);
};

export default MemberCard;

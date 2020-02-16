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
import React, { ComponentType, useState } from "react";
import ReactImageFallback from "react-image-fallback";
import { IBook } from "../../types";
import HistoryDialog from "../HistoryDialog";


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
	const [openHistory, setOpenHistory] = useState(false);

	const handleClickHistory = () =>
		setOpenHistory(!openHistory);

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
								{`${a.first_name} ${a.middle ? a.middle + " " : ""}${a.last_name}`}
							</Typography>
						);
					})}
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

				{/* Open Dialog for Book Edit History (Events) */}
				<Tooltip title="Edit History">
					<>
						<IconButton onClick={handleClickHistory}>
							<History />
						</IconButton>
						<HistoryDialog
							setOpen={setOpenHistory}
							open={openHistory}
							book={props.book} />
					</>
				</Tooltip>

				<Tooltip title="Edit">
					<IconButton>
						<EditOutlinedIcon />
					</IconButton>
				</Tooltip>

				<Tooltip title="Delete">
					<IconButton>
						<DeleteForeverIcon />
					</IconButton>
				</Tooltip>
			</CardActions>
		</Card>
	);
};

export default BookCard;

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
import React, { ComponentType } from "react";
import ReactImageFallback from "react-image-fallback";
import { IBook } from "../../types";


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
					<Typography gutterBottom variant="h5" component="h2">
						{props.book.title}
					</Typography>
					<Typography variant="body2" color="textSecondary" component="p">
						{props.book.description}
					</Typography>
				</CardContent>
			</CardActionArea>
			<CardActions style={{ display: "flex", justifyContent: "center" }}>
				<Tooltip title="History">
					<IconButton>
						<History />
					</IconButton>
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

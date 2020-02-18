import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { ComponentType } from "react";
import { IEvent } from "../../types";


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
			maxWidth: 752
		},
		demo: {
			backgroundColor: theme.palette.background.paper
		},
		title: {
			margin: theme.spacing(4, 0, 2)
		}
	})
);

export interface IHistoryList {
	events: IEvent[]
}

/**
 * Material list component for book events/history.
 * @param {IHistoryList} props
 * @returns {JSX.Element}
 * @constructor
 */
const HistoryList: ComponentType<IHistoryList> = (props: IHistoryList): JSX.Element => {
	const classes = useStyles();
	const numEvents = props.events.length;

	return (
		<div className={classes.root}>
			<div className={classes.demo}>
				<List dense={true}>

					{/* Events List */}
					{props.events.reverse().map((event, i) => {
						const createdAt = new Date(event.created_at).toLocaleString();
						const updatedAt = new Date(event.updated_at).toLocaleString();
						return (
							<ListItem key={i} style={{ display: "block" }}>
								<div>
									<strong>Event Type:</strong> {event.event_type}
								</div>
								<div>
									<strong>Updated:</strong> {updatedAt}
								</div>
								<div>
									<strong>Created:</strong> {createdAt}
								</div>
								<div>
									<strong>ISBN:</strong> {event.isbn}
								</div>
								<div>
									<strong>Book ID:</strong> {event.book_id}
								</div>
								<div>
									<strong>Title:</strong> {event.title}
								</div>
								<div>
									<strong>Description:</strong> {event.description}
								</div>
								<div>
									<strong>Image:</strong> {event.image_url || "N/A"}
								</div>
								{(i !== numEvents - 1) && <Divider style={{ margin: "1rem 0" }} />}
							</ListItem>
						);
					})}
				</List>
			</div>
		</div>
	);
};

export default HistoryList;

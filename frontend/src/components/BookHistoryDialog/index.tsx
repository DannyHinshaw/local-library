import { CircularProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import React, { ComponentType, useEffect, useState } from "react";
import { api } from "../../api";
import { IBook, IEvent, OrNull, StateSetter } from "../../types";
import HistoryList from "../HistoryList";


interface IBookHistoryDialog {
	setOpen: StateSetter<boolean>
	open: boolean
	book: IBook
}

/**
 * Dialog to display book event history.
 * @param {IBookHistoryDialog} props
 * @returns {JSX.Element}
 * @constructor
 */
const BookHistoryDialog: ComponentType<IBookHistoryDialog> = (props: IBookHistoryDialog): JSX.Element => {
	const { open } = props;
	const [events, setEvents] = useState([] as IEvent[]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as OrNull<string>);

	const handleClose = () =>
		props.setOpen(false);

	const descriptionElementRef = React.useRef<HTMLElement>(null);
	useEffect(() => {
		if (open) {
			if (!events.length) {
				setLoading(true);
				api.getEventsByBookISBN(props.book.isbn).then(res => {
					setEvents(res.data);
					setLoading(false);
					return;
				}).catch(err => {
					setError("Error loading book history...");
					setLoading(false);
					console.error(err);
				});
			}

			const { current: descriptionElement } = descriptionElementRef;
			if (descriptionElement !== null) {
				descriptionElement.focus();
			}
		}
	}, [open]);

	return (
		<div>
			<Dialog
				open={open}
				onClose={handleClose}
				scroll="paper"
				aria-labelledby="scroll-dialog-title"
				aria-describedby="scroll-dialog-description"
			>
				<DialogTitle id="scroll-dialog-title">
					Edits for ISBN: {props.book.isbn}
				</DialogTitle>

				<DialogContent dividers={true} style={{ padding: 0 }}>
					{loading
						? (<div style={{ textAlign: "center" }}>
								<CircularProgress />
							</div>
						)
						: error
							? "Oops, something went wrong :/"
							: <HistoryList events={events} />}
				</DialogContent>

				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Close
					</Button>
					<Button onClick={handleClose} color="primary">
						Download
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default BookHistoryDialog;

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import React, { ComponentType, useState } from "react";
import { api } from "../../api";
import { IBook, StateSetter } from "../../types";
import SubmitButton from "../SubmitButton";


export interface IBookDeleteDialogProps {
	setRefresh: StateSetter<boolean>
	setOpen: StateSetter<boolean>
	open: boolean
	book: IBook
}

/**
 * Confirmation dialog to prompt user before deleting a book.
 * @param {IBookDeleteDialogProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const BookDeleteDialog: ComponentType<IBookDeleteDialogProps> = (props: IBookDeleteDialogProps): JSX.Element => {
	const [error, setError] = useState(null as any);

	const handleClose = () => {
		props.setOpen(false);
	};

	const handleSubmit = () => {
		return api.deleteBookByISBN(props.book.isbn).then(res => {
			props.setRefresh(true);
			return res;
		});
	};

	return (
		<div>
			<Dialog
				open={props.open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{`Delete ISBN: ${props.book.isbn}?`}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to delete this book along with all it's copies?
						This is permanent and cannot be undone.
					</DialogContentText>
				</DialogContent>

				{error && (
					<>
						<br />
						<div style={{ textAlign: "center" }}>
							<Typography style={{ margin: "0 auto", width: "75%" }} color="error">
								{error}
							</Typography>
						</div>
					</>)}

				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Cancel
					</Button>
					<SubmitButton
						closeDialog={handleClose}
						handleSubmit={handleSubmit}
						setError={setError}
						text="Confirm" />

				</DialogActions>
			</Dialog>
		</div>
	);
};

export default BookDeleteDialog;

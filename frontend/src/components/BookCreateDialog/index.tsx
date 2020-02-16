import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { ChangeEvent, ComponentType, useState } from "react";
import { api, IPostNewBookPayload } from "../../api";
import { IBook, OrNull, StateSetter } from "../../types";
import AuthorSelect from "../AuthorSelect";
import SubmitButton from "../SubmitButton";


export interface IBookCreateDialog {
	setRefresh: StateSetter<boolean>
	setOpen: StateSetter<boolean>
	open: boolean
	book: IBook
}

/**
 * Form to edit book values.
 * @param {IBookCreateDialog} props
 * @returns {JSX.Element}
 * @constructor
 */
const BookCreateDialog: ComponentType<IBookCreateDialog> = (props: IBookCreateDialog): JSX.Element => {

	// Component State
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null as OrNull<string>);

	// Form Inputs Values
	const numCopies = props.book.copies.length;
	const initAuthorIDs = props.book.authors.map(a => a.id);
	const [copies, setCopies] = useState(numCopies);
	const [title, setTitle] = useState(props.book.title);
	const [imageURL, setImageURL] = useState<string>("");
	const [authorIDs, setAuthorIDs] = useState<string[]>(initAuthorIDs);
	const [description, setDescription] = useState(props.book.description);

	const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) =>
		setTitle(event.target.value);
	const handleChangeCopies = (event: ChangeEvent<HTMLInputElement>) =>
		setCopies(Number(event.target.value));
	const handleChangeDescription = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setDescription(event.target.value);

	const handleClose = () =>
		props.setOpen(false);

	const stopFormEvent = (e) =>
		e.preventDefault();

	const handleSubmit = () => {
		const payload: IPostNewBookPayload = {
			isbn: props.book.isbn,
			author_ids: authorIDs,
			image_url: imageURL,
			description,
			copies,
			title
		};

		setLoading(true);
		return api.postNewBook(payload).then(res => {
			props.setRefresh(true);
			return res;
		});
	};

	// TODO: Finish form
	return (
		<div>
			<Dialog
				aria-labelledby="form-dialog-title"
				onClose={handleClose}
				style={{ minWidth: 500 }}
				open={props.open}>
				<DialogTitle id="form-dialog-title">
					Edit Book
				</DialogTitle>
				<DialogContent>
					<form onSubmit={stopFormEvent}>
						<div>
							<TextField
								id="title"
								label="Title"
								value={title}
								fullWidth={true}
								onChange={handleChangeTitle}
							/>
						</div>
						<br />
						<div>
							<AuthorSelect
								setAuthorIDs={setAuthorIDs}
								authorIDs={authorIDs}
							/>
						</div>
						<br />
						<div>
							<TextField
								id="copies"
								label="Copies"
								value={copies}
								fullWidth={true}
								onChange={handleChangeCopies}
							/>
						</div>
						<br />
						<div>
							<Typography>
								Description:
							</Typography>
							<textarea
								cols={50}
								rows={15}
								id="description"
								placeholder="Description"
								value={description}
								onChange={handleChangeDescription}
							/>
						</div>
						<br />
						<DialogActions>
							<Button onClick={handleClose} color="primary">
								Cancel
							</Button>
							<SubmitButton closeDialog={handleClose} handleSubmit={handleSubmit} setError={setError} />
						</DialogActions>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default BookCreateDialog;

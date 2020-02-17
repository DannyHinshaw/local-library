import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { ChangeEvent, ComponentType, useState } from "react";
import { api, IPostNewBookPayload } from "../../api";
import { OrNull, StateSetter } from "../../types";
import AuthorSelect from "../AuthorSelect";
import SubmitButton from "../SubmitButton";


export interface IBookCreateDialog {
	setRefresh: StateSetter<boolean>
	setOpen: StateSetter<boolean>
	open: boolean
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
	const [copies, setCopies] = useState(1);
	const [isbn, setISBN] = useState("");
	const [title, setTitle] = useState("");
	const [imageURL, setImageURL] = useState<string>("");
	const [authorIDs, setAuthorIDs] = useState<string[]>([]);
	const [description, setDescription] = useState("");

	const handleChangeISBN = (event: ChangeEvent<HTMLInputElement>) =>
		setISBN(event.target.value);
	const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) =>
		setTitle(event.target.value);
	const handleChangeImageURL = (event: ChangeEvent<HTMLInputElement>) =>
		setImageURL(event.target.value);
	const handleChangeCopies = (event: ChangeEvent<HTMLInputElement>) =>
		setCopies(Number(event.target.value));
	const handleChangeDescription = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setDescription(event.target.value);

	const handleClose = () =>
		props.setOpen(false);

	const stopFormEvent = (e) =>
		e.preventDefault();

	const handleSubmit = () => {
		const sanitizedISBN = isbn.replace(/-/g, "");
		const isValidISBN13 = sanitizedISBN.length > 9 && sanitizedISBN.length < 14;
		if (!isValidISBN13) {
			const errMsg = "ISBN is required, valid ISBN's are between 10 and 13 digits";
			return Promise.resolve({ error: errMsg });
		}

		if (!title) {
			const errMsg = "Book title is required.";
			return Promise.resolve({ error: errMsg });
		}

		setError("");
		const payload: IPostNewBookPayload = {
			copies: copies || 1,
			author_ids: authorIDs,
			image_url: imageURL,
			description,
			title,
			isbn
		};

		setLoading(true);
		return api.postNewBook(payload).then(res => {
			props.setRefresh(true);
			return res;
		}).catch(e => {
			setError(e);
			console.error(e);
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
					Create New Book
				</DialogTitle>

				<DialogContent>
					<form onSubmit={stopFormEvent}>
						<div>
							<TextField
								id="isbn"
								label="ISBN"
								value={isbn}
								required={true}
								fullWidth={true}
								onChange={handleChangeISBN}
							/>
						</div>
						<br />

						<div>
							<TextField
								id="title"
								label="Title"
								value={title}
								required={true}
								fullWidth={true}
								onChange={handleChangeTitle}
							/>
						</div>
						<br />

						<div>
							<TextField
								id="imageURL"
								label="Image URL"
								value={imageURL}
								fullWidth={true}
								onChange={handleChangeImageURL}
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
								style={{ width: "100%" }}
							/>
						</div>
						<br />

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
							<SubmitButton closeDialog={handleClose} handleSubmit={handleSubmit} setError={setError} />
						</DialogActions>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default BookCreateDialog;

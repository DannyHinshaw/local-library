import { DialogActions } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { ChangeEvent, ComponentType, useState } from "react";
import { api, IPatchUpdateBookPayload } from "../../api";
import { IBook, StateSetter } from "../../types";
import AuthorSelect from "../AuthorSelect";
import SubmitButton from "../SubmitButton";


export interface IBookEditDialog {
	setRefresh: StateSetter<boolean>
	setOpen: StateSetter<boolean>
	open: boolean
	book: IBook
}

/**
 * Form to edit book values.
 * @param {IBookEditDialog} props
 * @returns {JSX.Element}
 * @constructor
 */
const BookEditDialog: ComponentType<IBookEditDialog> = (props: IBookEditDialog): JSX.Element => {

	// Form Inputs Values
	const initAuthorIDs = props.book.authors.map(a => a.id);
	const [title, setTitle] = useState(props.book.title);
	const [authorIDs, setAuthorIDs] = useState<string[]>(initAuthorIDs);
	const [description, setDescription] = useState(props.book.description);
	const [error, setError] = useState(null as any);

	const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) =>
		setTitle(event.target.value);

	const handleChangeDescription = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setDescription(event.target.value);

	const handleClose = () =>
		props.setOpen(false);

	const stopFormEvent = (e) =>
		e.preventDefault();

	const handleSubmit = (): Promise<any> => {
		const payload: IPatchUpdateBookPayload = {
			isbn: props.book.isbn,
			author_ids: authorIDs
		};

		if (title !== props.book.title) {
			payload.title = title;
		}
		if (description !== props.book.description) {
			payload.description = description;
		}

		return api.patchUpdateBookByISBN(payload).then(res => {
			props.setRefresh(true);
			return res;
		});
	};

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
							<Typography>
								Description:
							</Typography>
							<textarea
								cols={50}
								rows={15}
								id="description"
								placeholder="Description"
								onChange={handleChangeDescription}
								value={description}
								style={{ width: "100%" }}
							/>
							<br />
						</div>

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

export default BookEditDialog;

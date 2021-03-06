import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import React, { ChangeEvent, ComponentType, useState } from "react";
import { api, IPostNewMemberPayload } from "../../api";
import { OrNull, StateSetter } from "../../types";
import ErrorSpan from "../ErrorSpan";
import SubmitButton from "../SubmitButton";


export interface IMemberCreateDialog {
	setRefresh: StateSetter<boolean>
	setOpen: StateSetter<boolean>
	open: boolean
}

/**
 * Form to edit book values.
 * @param {IMemberCreateDialog} props
 * @returns {JSX.Element}
 * @constructor
 */
const MemberCreateDialog: ComponentType<IMemberCreateDialog> = (props: IMemberCreateDialog): JSX.Element => {

	// Component State
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null as OrNull<string>);

	// Form Inputs Values
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [middle, setMiddle] = useState("");
	const [imgURL, setImgURL] = useState("");

	const handleChangeFirstName = (event: ChangeEvent<HTMLInputElement>) =>
		setFirstName(event.target.value);
	const handleChangeLastName = (event: ChangeEvent<HTMLInputElement>) =>
		setLastName(event.target.value);
	const handleChangeMiddle = (event: ChangeEvent<HTMLInputElement>) =>
		setMiddle(event.target.value);
	const handleChangeImgURL = (event: ChangeEvent<HTMLInputElement>) =>
		setImgURL(event.target.value);

	const handleClose = () =>
		props.setOpen(false);

	const stopFormEvent = (e) =>
		e.preventDefault();

	const handleSubmit = async () => {
		if (!firstName) {
			const errMsg = "First name is required.";
			return { error: errMsg };
		}
		if (!lastName) {
			const errMsg = "Last name is required.";
			return { error: errMsg };
		}

		setError("");
		const payload: IPostNewMemberPayload = {
			image_url: imgURL,
			first_name: firstName,
			last_name: lastName,
			middle
		};

		setLoading(true);
		return api.postCreateNewMember(payload).then(res => {
			props.setRefresh(true);
			return res;
		}).catch(e => {
			setError(e);
			console.error(e);
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
					Create New Member
				</DialogTitle>

				<DialogContent>
					<form onSubmit={stopFormEvent}>
						<div>
							<TextField
								id="firstName"
								label="First Name"
								value={firstName}
								required={true}
								fullWidth={true}
								onChange={handleChangeFirstName}
							/>
						</div>
						<br />

						<div>
							<TextField
								id="middle"
								label="Middle"
								value={middle}
								fullWidth={true}
								onChange={handleChangeMiddle}
							/>
						</div>
						<br />

						<div>
							<TextField
								id="lastName"
								label="Last Name"
								value={lastName}
								required={true}
								fullWidth={true}
								onChange={handleChangeLastName}
							/>
						</div>
						<br />

						<div>
							<TextField
								id="imgURL"
								label="Avatar URL"
								value={imgURL}
								fullWidth={true}
								onChange={handleChangeImgURL}
							/>
						</div>
						<br />

						<ErrorSpan error={error} />

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

export default MemberCreateDialog;

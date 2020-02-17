import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import React, { ComponentType, useState } from "react";
import { BookState } from "../../store/reducers/booksReducer";
import { CheckoutsState } from "../../store/reducers/checkoutsReducer";
import { IMember, OrNull, StateSetter } from "../../types";
import { getPersonName } from "../../util/data";
import BooksSelect from "../BooksSelect";
import SubmitButton from "../SubmitButton";


interface IMemberCheckoutDialogProps {
	setOpen: StateSetter<boolean>
	checkouts: CheckoutsState
	books: BookState
	member: IMember
	open: boolean
}

/**
 * Dialog to display book event history.
 * @param {IMemberCheckoutDialogProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const MemberCheckoutDialog: ComponentType<IMemberCheckoutDialogProps> = (props: IMemberCheckoutDialogProps): JSX.Element => {
	const { open } = props;
	const memberName = getPersonName(props.member);

	const [bookISBNs, setBookISBNs] = useState([] as string[]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as OrNull<string>);

	// TODO: If there's time, filter books by only those available.
	// const booksAvailable = props.books.filter((base: IBook[], curr: book) => {
	// 	const isCheckedOut = props.checkouts.some(c => {
	// 		return c.
	// 	})
	// }, [])

	const handleSubmit = () => {
		console.log("TODO: Handle CHECKOUT");
		return Promise.resolve();
	};

	const handleClose = () =>
		props.setOpen(false);

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
					Checkout Books For: {memberName}
					<br />
					<span style={{ fontSize: 15, color: "grey" }}>
						Member ID: {props.member.id}
					</span>
				</DialogTitle>

				<DialogContent dividers={true} style={{ textAlign: "center", padding: 0 }}>
					<BooksSelect
						bookISBNs={bookISBNs}
						booksAvailable={props.books}
						setBookISBNs={setBookISBNs} />
				</DialogContent>

				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Close
					</Button>
					<SubmitButton
						closeDialog={handleClose}
						handleSubmit={handleSubmit}
						setError={setError} />
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default MemberCheckoutDialog;

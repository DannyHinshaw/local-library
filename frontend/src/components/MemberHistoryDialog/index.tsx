import { CircularProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import React, { ComponentType, useEffect, useState } from "react";
import { api } from "../../api";
import { ICheckout, IMember, OrNull, StateSetter } from "../../types";
import { getPersonName } from "../../util/data";
import CheckoutsList from "../CheckoutsList";


interface IMemberHistoryDialogProps {
	setOpen: StateSetter<boolean>
	member: IMember
	open: boolean
}

/**
 * Dialog to display book event history.
 * @param {IMemberHistoryDialogProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const MemberHistoryDialog: ComponentType<IMemberHistoryDialogProps> = (props: IMemberHistoryDialogProps): JSX.Element => {
	const { open } = props;
	const memberName = getPersonName(props.member);
	const [checkouts, setCheckouts] = useState([] as ICheckout[]);
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as OrNull<string>);

	const handleClose = () =>
		props.setOpen(false);

	const descriptionElementRef = React.useRef<HTMLElement>(null);
	useEffect(() => {
		if (open) {
			if (!checkouts.length || refresh) {
				setLoading(true);
				api.getCheckoutsByMemberID(props.member.id).then(res => {
					setCheckouts(res.data);
					setLoading(false);
					setRefresh(false);
					return;
				}).catch(err => {
					setError("Error loading book history...");
					setLoading(false);
					setRefresh(false);
					console.error(err);
				});
			}

			const { current: descriptionElement } = descriptionElementRef;
			if (descriptionElement !== null) {
				descriptionElement.focus();
			}
		}
	}, [open, refresh]);

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
					Checkout History For: {memberName}
					<br />
					<span style={{ fontSize: 15, color: "grey" }}>
						Member ID: {props.member.id}
					</span>
				</DialogTitle>

				<DialogContent dividers={true} style={{ padding: 0 }}>
					{loading
						? <div style={{ textAlign: "center" }}>
							<CircularProgress />
						</div>
						: error
							? "Oops, something went wrong :/"
							: <CheckoutsList
								checkouts={checkouts}
								setLoading={setLoading}
								setRefresh={setRefresh}
								setError={setError} />}
				</DialogContent>

				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default MemberHistoryDialog;

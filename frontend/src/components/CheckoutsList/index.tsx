import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AssignmentReturnIcon from "@material-ui/icons/AssignmentReturn";
import React, { ComponentType } from "react";
import { api } from "../../api";
import { ICheckout, OrNull, StateSetter } from "../../types";
import "./styles.scss";

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

export interface ICheckoutsListProps {
	setLoading: StateSetter<boolean>
	setRefresh: StateSetter<boolean>
	setError: StateSetter<OrNull<string>>
	checkouts: ICheckout[]
}

/**
 * Material list component for viewing member checkout histories.
 * @param {ICheckoutsListProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const CheckoutsList: ComponentType<ICheckoutsListProps> = (props: ICheckoutsListProps): JSX.Element => {
	const classes = useStyles();
	const numEvents = props.checkouts.length;

	const handleClickReturn = (checkout: ICheckout) => () => {
		props.setLoading(true);
		api.patchReturnCheckout({
			member_id: checkout.member_id,
			book_id: checkout.book_id
		}).then(res => {
			props.setLoading(false);
			props.setRefresh(true);
		}).catch(e => {
			props.setLoading(false);
			props.setError(e);
		});
	};

	return (
		<div className={classes.root}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<div className={classes.demo}>
						<List dense={true}>

							{/* Member Checkouts List */}
							{!props.checkouts.length
								? <div style={{ textAlign: "center" }}>No checkout history yet!</div>
								: props.checkouts.reverse().map((checkout, i) => {
									const checkedOutAt = new Date(checkout.checked_out).toLocaleString();
									const returnedAt = new Date(checkout.returned).toLocaleString();
									return (
										<ListItem key={i}>
											<div id="gridParent">

												{/* Column Headings */}
												<strong>Book ID:</strong>
												<strong>Checked Out:</strong>
												<strong>
													{checkout.returned
														? "Returned On:"
														: "Return Now:"}
												</strong>

												{/* Values */}
												<div style={{ textAlign: "center" }}>
													{checkout.book_id}
												</div>
												<div>
													{checkedOutAt}
												</div>
												<div>
													{checkout.returned
														? returnedAt
														: (
															<Tooltip title="Click to return">
																<IconButton
																	onClick={handleClickReturn(checkout)}
																	style={{ padding: 0, margin: "0 0 0 20%", textAlign: "center" }}>
																	<AssignmentReturnIcon />
																</IconButton>
															</Tooltip>
														)}
												</div>
											</div>
										</ListItem>
									);
								})}
						</List>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default CheckoutsList;

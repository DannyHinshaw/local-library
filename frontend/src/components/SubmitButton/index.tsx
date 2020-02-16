import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import clsx from "clsx";
import React, { ComponentType } from "react";
import { StateSetter } from "../../types";


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: "flex",
			alignItems: "center"
		},
		wrapper: {
			margin: theme.spacing(1),
			position: "relative"
		},
		buttonSuccess: {
			backgroundColor: green[500],
			"&:hover": {
				backgroundColor: green[700]
			}
		},
		buttonProgress: {
			color: green[500],
			position: "absolute",
			top: "50%",
			left: "50%",
			marginTop: -12,
			marginLeft: -12
		}
	})
);

export interface IButtonLoaderProps {
	handleSubmit: () => Promise<any>
	closeDialog: () => void
	setError: StateSetter<any>
}

/**
 * Submit button component with progress loader integrated into it.
 * @param {IButtonLoaderProps} props
 * @returns {any}
 * @constructor
 */
const SubmitButton: ComponentType<IButtonLoaderProps> = (props: IButtonLoaderProps) => {
	const classes = useStyles();
	const [loading, setLoading] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const genericErrorMsg = `
		Sorry, something went wrong.
		Please try again later.`;
	const buttonClassname = clsx({
		[classes.buttonSuccess]: success
	});

	const handleButtonClick = () => {
		setLoading(true);
		props.handleSubmit().then((res) => {
			if (res.status > 204) {
				props.setError(genericErrorMsg);
				console.log("ERROR::", res);
				setLoading(false);
				return res;
			}

			// Let the loader paint a little
			setTimeout(() => {
				setLoading(false);
				setSuccess(true);
				setTimeout(() => {
					props.closeDialog();
				}, 150);
			}, 150);
		}).catch(e => {
			setLoading(false);
			props.setError(e);
			console.error(e);
		});
	};

	return (
		<div className={classes.root}>
			<div className={classes.wrapper}>
				<Button
					type="submit"
					color="primary"
					className={buttonClassname}
					onClick={handleButtonClick}
					disabled={loading}
				>
					Submit
				</Button>
				{loading && <CircularProgress size={24} className={classes.buttonProgress} />}
			</div>
		</div>
	);
};

export default SubmitButton;

import CircularProgress from "@material-ui/core/CircularProgress";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { ComponentType } from "react";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			height: "75vh",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			margin: "0 auto",
			"& > * + *": {
				marginLeft: theme.spacing(2)
			}
		}
	})
);

export interface ILoaderCircleProps {
	size?: number
}

const LoaderCircle: ComponentType<ILoaderCircleProps> = (props: ILoaderCircleProps): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<CircularProgress size={props.size} />
		</div>
	);
};
export default LoaderCircle;

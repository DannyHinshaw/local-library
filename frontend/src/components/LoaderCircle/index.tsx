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
	height?: number
	size?: number
}

/**
 * Util loading component.
 * @param {ILoaderCircleProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const LoaderCircle: ComponentType<ILoaderCircleProps> = (props: ILoaderCircleProps): JSX.Element => {
	const classes = useStyles();
	return (
		<div className={classes.root} style={{ height: props.height }}>
			<CircularProgress size={props.size} />
		</div>
	);
};
export default LoaderCircle;

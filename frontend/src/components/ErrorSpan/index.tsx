import Typography from "@material-ui/core/Typography";
import React, { ComponentType } from "react";


export interface IErrorSpanProps {
	error: any
}

/**
 * Util component for displaying errors with same styling.
 * @param {IErrorSpanProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const ErrorSpan: ComponentType<IErrorSpanProps> = (props: IErrorSpanProps): JSX.Element => {
	return props.error && (
		<>
			<br />
			<div style={{ textAlign: "center" }}>
				<Typography style={{ margin: "0 auto", width: "75%" }} color="error">
					{props.error}
				</Typography>
			</div>
		</>);
};

export default ErrorSpan;

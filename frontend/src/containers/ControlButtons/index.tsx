import Button from "@material-ui/core/Button";
import { green } from "@material-ui/core/colors";
import GetApp from "@material-ui/icons/GetApp";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import React, { ComponentType } from "react";
import { StateSetter } from "../../types";
import "./styles.scss";


export interface IControlButtonsProps {
	setView: StateSetter<number>
	view: number
}

type ControlButtonsComponent = ComponentType<IControlButtonsProps>

/**
 * Main application controls buttons.
 * @param {IControlButtonsProps} props
 * @returns {JSX.Element}
 * @constructor
 */
const ControlButtons: ControlButtonsComponent = (props: IControlButtonsProps): JSX.Element => {

	const handleDownloadReport = () =>
		console.log("TODO: Report for whatever view (authors/books)");

	const handleClick = (n: number) => () =>
		props.setView(n);

	const disabled: string = "#8187a6";
	const firstButtonColor = props.view === 2
		? { backgroundColor: disabled }
		: {};
	const secondButtonColor = props.view === 1
		? { backgroundColor: disabled }
		: {};

	return (
		<div id="controlButtons">
			<div id="viewButtons">
				<Button
					color="primary"
					variant="contained"
					startIcon={<MenuBookIcon />}
					onClick={handleClick(1)}
					style={firstButtonColor}>
					Books
				</Button>
				<Button
					color="primary"
					variant="contained"
					startIcon={<PermIdentityIcon />}
					onClick={handleClick(2)}
					style={secondButtonColor}>
					Authors
				</Button>
			</div>

			<div id="reports">
				<Button
					color="primary"
					variant="contained"
					startIcon={<GetApp />}
					onClick={handleDownloadReport}
					style={{ backgroundColor: green[500] }}>
					Report
				</Button>
			</div>
		</div>
	);
};

export default ControlButtons;

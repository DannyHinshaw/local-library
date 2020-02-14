import Button from "@material-ui/core/Button";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import React, { ComponentType, useEffect } from "react";
import { api } from "../../api";
import "./styles.scss";


const NavMenu: ComponentType = (): JSX.Element => {

	const [loading, setLoading] = React.useState(true);
	const [selected, setSelected] = React.useState(1);

	useEffect(() => {
		api.getAllBooks().then(res => {
			console.log("OHHHH YEAAAAAA:::::", res);
		}).catch(console.error);
	}, []);

	const handleClick = (n) => () =>
		setSelected(n);

	const disabled: string = "#8187a6";
	const firstButtonColor = selected === 2
		? { backgroundColor: disabled }
		: {};
	const secondButtonColor = selected === 1
		? { backgroundColor: disabled }
		: {};

	return (
		<div id="menuButtons">
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
	);
};

export default NavMenu;

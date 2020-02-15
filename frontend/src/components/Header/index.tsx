import Box from "@material-ui/core/Box";
import LocalLibraryIcon from "@material-ui/icons/LocalLibraryOutlined";
import React, { ComponentType } from "react";
import "./styles.scss";


/**
 * Display title/logo header.
 * @returns {JSX.Element}
 * @constructor
 */
const Header: ComponentType = (): JSX.Element => {
	return (
		<div id="navHeader">
			<div id="headerContainer">
				<div id="logoWrap">
					<LocalLibraryIcon />
				</div>

				<div id="headerText">
					<Box fontSize={16}>
						Local Library
					</Box>
					<Box fontSize={12}>
						<strong>Address:</strong> 127.0.0.1
					</Box>
				</div>
			</div>
		</div>
	);
};

export default Header;

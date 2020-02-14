import { Typography } from "@material-ui/core";
import LocalLibraryIcon from "@material-ui/icons/LocalLibrary";
import React, { ComponentType } from "react";
import "./styles.scss";


const Header: ComponentType = (): JSX.Element => {
	return (
		<header>
			<div className="left-group">
				<LocalLibraryIcon />
				<Typography>
					Local Library
				</Typography>
			</div>

			<div className="right-group">
				<Typography>
					<strong>Address:</strong> 127.0.0.1
				</Typography>
			</div>
		</header>
	);
};

export default Header;

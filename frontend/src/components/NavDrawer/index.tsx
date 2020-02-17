import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeftOutlined";
import ChevronRightIcon from "@material-ui/icons/ChevronRightOutlined";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooksOutlined";
import MenuIcon from "@material-ui/icons/MenuOutlined";
import PeopleIcon from "@material-ui/icons/PeopleAltOutlined";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccountOutlined";
import clsx from "clsx";
import React, { ComponentType, useState } from "react";
import { AppView } from "../../App";
import AuthorsView from "../../containers/AuthorsView";
import BooksView from "../../containers/BooksView";
import MembersView from "../../containers/MembersView";
import Header from "../Header";


const drawerWidth = 175;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: "flex"
		},
		appBar: {
			transition: theme.transitions.create(["margin", "width"], {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen
			})
		},
		appBarShift: {
			width: `calc(100% - ${drawerWidth}px)`,
			marginLeft: drawerWidth,
			transition: theme.transitions.create(["margin", "width"], {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen
			})
		},
		menuButton: {
			marginRight: theme.spacing(2)
		},
		hide: {
			display: "none"
		},
		drawer: {
			width: drawerWidth,
			flexShrink: 0
		},
		drawerPaper: {
			width: drawerWidth
		},
		drawerHeader: {
			display: "flex",
			alignItems: "center",
			padding: theme.spacing(0, 1),
			...theme.mixins.toolbar,
			justifyContent: "flex-end"
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(3),
			transition: theme.transitions.create("margin", {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen
			}),
			marginLeft: -drawerWidth
		},
		contentShift: {
			transition: theme.transitions.create("margin", {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen
			}),
			marginLeft: 0
		}
	})
);


/**
 * Main application navigational wrapper.
 * @returns {JSX.Element}
 * @constructor
 */
const NavDrawer: ComponentType = (): JSX.Element => {
	const classes = useStyles();
	const theme = useTheme();

	const [open, setOpen] = React.useState(false);
	const [view, setView] = useState(AppView.BOOKS);
	const handleMenuItemClick = (n: AppView) => () => setView(n);

	const handleDrawerOpen = () =>
		setOpen(true);

	const handleDrawerClose = () =>
		setOpen(false);

	// Toggle current view
	const currentView = (): JSX.Element => {
		switch (view) {
			case AppView.BOOKS:
				return <BooksView />;
			case AppView.AUTHORS:
				return <AuthorsView />;
			case AppView.MEMBERS:
				return <MembersView />;
			default:
				return <BooksView />;
		}
	};

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar
				position="fixed"
				className={clsx(classes.appBar, {
					[classes.appBarShift]: open
				})}
			>
				<Toolbar>
					<IconButton
						edge="start"
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						className={clsx(classes.menuButton, open && classes.hide)}
					>
						<MenuIcon />
					</IconButton>
					<Header />
				</Toolbar>
			</AppBar>
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="left"
				open={open}
				classes={{
					paper: classes.drawerPaper
				}}
			>
				<div className={classes.drawerHeader}>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === "ltr"
							? <ChevronLeftIcon />
							: <ChevronRightIcon />}
					</IconButton>
				</div>
				<Divider />

				{/* Main Routes */}
				<List>

					{/* Books */}
					<ListItem
						onClick={handleMenuItemClick(1)}
						selected={view === AppView.BOOKS}
						style={{ minWidth: 46 }}
						button={true}
						key="Books">
						<ListItemIcon>
							<LibraryBooksIcon />
						</ListItemIcon>
						<ListItemText primary="Books" />
					</ListItem>

					{/* Authors */}
					<ListItem
						onClick={handleMenuItemClick(2)}
						selected={view === AppView.AUTHORS}
						style={{ minWidth: 46 }}
						button={true}
						key="Authors">
						<ListItemIcon>
							<PeopleIcon />
						</ListItemIcon>
						<ListItemText primary="Authors" />
					</ListItem>

					{/* Members */}
					<ListItem
						onClick={handleMenuItemClick(3)}
						selected={view === AppView.MEMBERS}
						style={{ minWidth: 46 }}
						button={true}
						key="Members">
						<ListItemIcon>
							<SupervisorAccountIcon />
						</ListItemIcon>
						<ListItemText primary="Members" />
					</ListItem>
				</List>
			</Drawer>
			<main
				className={clsx(classes.content, {
					[classes.contentShift]: open
				})}
			>
				<div className={classes.drawerHeader} />

				{/* View Containers */}
				{currentView()}

			</main>
		</div>
	);
};

export default NavDrawer;

import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React, { ComponentType, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { connect } from "react-redux";
import { api } from "../../api";
import AuthorCard from "../../components/AuthorCard";
import AuthorCreateDialog from "../../components/AuthorCreateDialog";
import LoaderCircle from "../../components/LoaderCircle";
import { authorsSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";
import { IAuthor } from "../../types";
import "./styles.scss";


const breakpointColumnsObj = {
	default: 3,
	700: 2,
	500: 1
};

export interface IAuthorsView {
	authorsSet: typeof authorsSet
	authors: AuthorsState
}

/**
 * View/layout container for author cards lists.
 * @param {IAuthorsView} props
 * @returns {JSX.Element}
 * @constructor
 */
const AuthorsView: ComponentType<IAuthorsView> = (props: IAuthorsView): JSX.Element => {
	const [loading, setLoading] = useState(true);
	const [refresh, setRefresh] = useState(false);
	const [openCreateDialog, setOpenCreateDialog] = useState(false);

	const stopLoader = () => setLoading(false);

	const handleClickCreateDialog = () =>
		setOpenCreateDialog(!openCreateDialog);

	const handleAuthorData = (data: any[]) => {
		const authors = data as AuthorsState;
		props.authorsSet(authors);
	};

	const handleGetData = () => {
		api.getAllAuthors().then(res => {
			if (res.data.length) {
				handleAuthorData(res.data);
			}
			stopLoader();
		}).catch(e => {
			console.error(e);
			stopLoader();
		});
	};

	// On load
	useEffect(() => {
		handleGetData();
	}, []);

	// On refresh trigger
	useEffect(() => {
		if (refresh) {
			setRefresh(false);
			api.getAllAuthors().then(res => {
				if (res.data.length) {
					handleAuthorData(res.data);
				}
				stopLoader();
			}).catch(e => {
				console.error(e);
				stopLoader();
			});
		}
	}, [refresh]);

	const sortAuthorsByName = (a, b): number =>
		a.first_name.localeCompare(b.first_name);

	const renderCards = (): JSX.Element[] => {
		const authorsSorted: IAuthor[] = props.authors.sort(sortAuthorsByName);
		return authorsSorted.map((author: IAuthor, i: number) => {
			return <AuthorCard author={author} key={i} />;
		});
	};

	return loading
		? <LoaderCircle size={100} />
		: (<>
				<div id="authorsControlsContainer">
					<Button
						onClick={handleClickCreateDialog}
						startIcon={<AddIcon />}
						variant="contained"
						color="secondary"
						size="large"
					>
						Add Author
					</Button>
					<AuthorCreateDialog
						setRefresh={setRefresh}
						setOpen={setOpenCreateDialog}
						open={openCreateDialog} />
				</div>
				<br />
				<div id="masonryContainer">
					<Masonry
						className="my-masonry-grid"
						breakpointCols={breakpointColumnsObj}
						columnClassName="my-masonry-grid_column">
						{renderCards()}
					</Masonry>
				</div>
			</>
		);
};


const mapStateToProps = ({ authors }) => ({ authors });
export default connect(mapStateToProps, {
	authorsSet
})(AuthorsView);

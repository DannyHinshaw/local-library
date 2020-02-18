import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React, { ComponentType, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { connect } from "react-redux";
import { api } from "../../api";
import LoaderCircle from "../../components/LoaderCircle";
import MemberCard from "../../components/MemberCard";
import MemberCreateDialog from "../../components/MemberCreateDialog";
import { authorsSet, booksSet, checkoutsSet, membersSet } from "../../store/actions";
import { BookState } from "../../store/reducers/booksReducer";
import { CheckoutsState } from "../../store/reducers/checkoutsReducer";
import { MembersState } from "../../store/reducers/membersReducer";
import { IMember, OrNull } from "../../types";
import "./styles.scss";


const breakpointColumnsObj = {
	default: 4,
	900: 3,
	700: 2,
	500: 1
};

export interface IMembersView {
	checkoutsSet: typeof checkoutsSet
	membersSet: typeof membersSet
	booksSet: typeof booksSet
	checkouts: CheckoutsState
	members: MembersState
	books: BookState
}

/**
 * View/layout container for author/book cards lists.
 * @param {IMembersView} props
 * @returns {JSX.Element}
 * @constructor
 */
const MembersView: ComponentType<IMembersView> = (props: IMembersView): JSX.Element => {
	const [loading, setLoading] = useState(true);
	const [refresh, setRefresh] = useState(false);
	const [openCreateDialog, setOpenCreateDialog] = useState(false);

	const stopLoader = () => setLoading(false);

	const handleClickCreateDialog = () =>
		setOpenCreateDialog(!openCreateDialog);

	const handleCheckoutData = (data: any[]) => {
		const checkouts = data as CheckoutsState;
		return props.checkoutsSet(checkouts);
	};

	const handleMembersData = (data: any[]) => {
		const members = data as MembersState;
		return props.membersSet(members);
	};

	const handleBookData = (data: any[]) => {
		const books = data as BookState;
		return props.booksSet(books);
	};

	// Retrieve and store checkouts.
	const fetchCheckouts = () => api.getAllCheckouts().then((res): OrNull<any> => {
		return res.data.length
			? handleCheckoutData(res.data)
			: null;
	});

	// Retrieve and store members.
	const fetchMembers = () => api.getAllMembers().then((res): OrNull<any> => {
		return res.data.length
			? handleMembersData(res.data)
			: null;
	});

	// Retrieve and store books.
	const fetchBooks = () => api.getAllBooks().then((res): OrNull<any> => {
		return res.data.length
			? handleBookData(res.data)
			: null;
	});

	useEffect(() => {
		if (refresh || !props.books.length || !props.members.length) {
			setRefresh(false);
			Promise.all([
				fetchBooks(),
				fetchMembers(),
				fetchCheckouts()
			]).then((hasData) => {

				// Seed the database if there's no test data yet.
				if (!hasData[0]) {
					return api.getSeedDatabase()
						.then(console.log)
						.then(window.location.reload)
						.catch(console.error);
				}

				return stopLoader();
			}).catch(console.error);
		} else {
			stopLoader();
		}
	}, [refresh]);

	const sortBooksByTitle = (a, b): number =>
		a.title.localeCompare(b.title);

	const sortMembersByName = (a, b): number =>
		a.first_name.localeCompare(b.first_name);

	const renderCards = (): JSX.Element[] => {
		const membersSorted: IMember[] = props.members.sort(sortMembersByName);
		return membersSorted.map((member: IMember, i: number) => {
			return <MemberCard
				books={props.books}
				checkouts={props.checkouts}
				member={member}
				key={i} />;
		});
	};

	return loading
		? <LoaderCircle size={100} />
		: (
			<>
				<div id="membersControlsContainer">
					<Button
						onClick={handleClickCreateDialog}
						startIcon={<AddIcon />}
						variant="contained"
						color="secondary"
						size="large"
					>
						Add Member
					</Button>
					<MemberCreateDialog
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

const mapStateToProps = ({ books, checkouts, members }) =>
	({ books, checkouts, members });
export default connect(mapStateToProps, {
	checkoutsSet,
	membersSet,
	authorsSet,
	booksSet
})(MembersView);

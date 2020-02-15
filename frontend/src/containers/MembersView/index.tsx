import React, { ComponentType, useEffect } from "react";
import { connect } from "react-redux";
import { api } from "../../api";
import { authorsSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";


export interface IBooksView {
	authorsSet: typeof authorsSet
	authors: AuthorsState
}

/**
 * View/layout container for members cards lists.
 * @param {IBooksView} props
 * @returns {JSX.Element}
 * @constructor
 */
const MembersView: ComponentType<IBooksView> = (props: IBooksView): JSX.Element => {
	const handleAuthorData = (data: any[]) => {
		const authors = data as AuthorsState;
		props.authorsSet(authors);
	};

	useEffect(() => {
		api.getAllMembers().then(res => {
			if (res.data.length) {
				return handleAuthorData(res.data);
			}

			// Seed the database if there's no test data yet.
			api.getSeedDatabase()
				.then(console.log)
				.catch(console.error);

			console.log("res::", res);
		}).catch(console.error);
	}, []);

	return (
		<div>
			MEMBERS VIEW
		</div>
	);
};

const mapStateToProps = ({ authors }) => ({ authors });
export default connect(mapStateToProps, {
	authorsSet
})(MembersView);

import React, { ComponentType, useEffect } from "react";
import { connect } from "react-redux";
import { api } from "../../api";
import { authorsSet } from "../../store/actions";
import { AuthorsState } from "../../store/reducers/authorsReducer";


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

	const handleAuthorData = (data: any[]) => {
		const authors = data as AuthorsState;
		props.authorsSet(authors);
	};

	useEffect(() => {
		api.getAllAuthors().then(res => {
			if (res.data.length) {
				return handleAuthorData(res.data);
			}
		}).catch(console.error);
	}, []);

	return (
		<div>
			AUTHORS VIEW
		</div>
	);
};

const mapStateToProps = ({ authors }) => ({ authors });
export default connect(mapStateToProps, {
	authorsSet
})(AuthorsView);

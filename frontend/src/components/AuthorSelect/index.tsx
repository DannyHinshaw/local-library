import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React, { ChangeEvent, ComponentType } from "react";
import { connect } from "react-redux";
import { AuthorsState } from "../../store/reducers/authorsReducer";
import { IAuthor, OrUndefined, StateSetter } from "../../types";
import { getPersonName } from "../../util/data";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250
		}
	}
};

export interface IAuthorSelectProps {
	setAuthorIDs: StateSetter<string[]>
	authorIDs: string[]
	authors?: AuthorsState
}


/**
 * Multi-select component for choosing book authors.
 * @returns {JSX.Element}
 * @constructor
 */
const AuthorSelect: ComponentType<IAuthorSelectProps> = (props: IAuthorSelectProps): JSX.Element => {
	const authorsList = (props.authors ? props.authors : []).sort((a, b) => {
		return a.first_name.localeCompare(b.first_name);
	});

	const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
		const ids = event.target.value as string[];
		console.log("handleChange::ids", ids);
		props.setAuthorIDs(ids);
	};

	/**
	 * Handle displaying author names instead of ids.
	 * @param ids
	 * @returns {string}
	 */
	const renderValue = (ids: any) => {
		const authorIDs = ids as string[];
		const authorNames = authorIDs.reduce((base: string[], id: string) => {
			const author: OrUndefined<IAuthor> = authorsList.find(a => a.id === id);
			if (author) {
				const authorName: string = getPersonName(author);
				return base.concat(authorName);
			}

			return base;
		}, []);

		return authorNames.join(", ");
	};

	return (
		<FormControl fullWidth={true}>
			<InputLabel id="demo-mutiple-checkbox-label">
				Authors
			</InputLabel>
			<Select
				multiple={true}
				input={<Input />}
				MenuProps={MenuProps}
				value={props.authorIDs}
				onChange={handleChange}
				renderValue={renderValue}
				labelId="mutiple-checkbox-label"
				id="mutiple-checkbox">
				{authorsList.map((author, i) => {
					return (
						<MenuItem key={author.id} value={author.id}>
							<Checkbox checked={props.authorIDs.includes(author.id)} />
							<ListItemText primary={getPersonName(author)} />
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
};

const mapStateToProps = ({ authors }) => ({ authors });
export default connect(mapStateToProps, null)(AuthorSelect);

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React, { ChangeEvent, ComponentType } from "react";
import { BookState } from "../../store/reducers/booksReducer";
import { IBook, OrUndefined, StateSetter } from "../../types";


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

export interface IBooksSelectProps {
	setBookISBNs: StateSetter<string[]>
	booksAvailable: BookState
	bookISBNs: string[]
}


/**
 * Multi-select component for choosing books to checkout for a member.
 * @returns {JSX.Element}
 * @constructor
 */
const BooksSelect: ComponentType<IBooksSelectProps> = (props: IBooksSelectProps): JSX.Element => {
	const booksList = (props.booksAvailable ? props.booksAvailable : []).sort((a, b) => {
		return a.title.localeCompare(b.title);
	});

	const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
		const isbns = event.target.value as string[];
		console.log("handleChange::isbns", isbns);
		props.setBookISBNs(isbns);
	};

	/**
	 * Handle displaying author names instead of ids.
	 * @param isbns
	 * @returns {string}
	 */
	const renderValue = (ISBNs: any) => {
		const isbns = ISBNs as string[];
		const bookTitles = isbns.reduce((base: string[], id: string) => {
			const book: OrUndefined<IBook> = booksList.find(b => b.isbn === id);
			if (book) {
				return base.concat(book.title);
			}

			return base;
		}, []);

		return bookTitles.join(", ");
	};

	return (
		<FormControl style={{ height: "5rem", width: "95%" }}>
			<InputLabel id="mutiple-checkbox-label">
				Books Available
			</InputLabel>
			<Select
				multiple={true}
				input={<Input />}
				MenuProps={MenuProps}
				value={props.bookISBNs}
				onChange={handleChange}
				renderValue={renderValue}
				labelId="mutiple-checkbox-label"
				id="mutiple-checkbox">
				{booksList.map((book, i) => {
					return (
						<MenuItem key={book.isbn} value={book.isbn}>
							<Checkbox checked={props.bookISBNs.includes(book.isbn)} />
							<ListItemText primary={book.title} />
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
};

export default BooksSelect;

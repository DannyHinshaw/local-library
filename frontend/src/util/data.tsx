import { IAuthor } from "../types";

export const getAuthorName = (author: IAuthor) =>
	`${author.first_name} ${author.middle ? author.middle + " " : ""}${author.last_name}`;

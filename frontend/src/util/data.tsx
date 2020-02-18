import { IAuthor, IMember } from "../types";

export const getPersonName = (author: IAuthor | IMember) =>
	`${author.first_name} ${author.middle ? author.middle + " " : ""}${author.last_name}`;

export interface IBase {
	created_at: string
	updated_at: string
}

export interface IAuthor extends IBase {
	first_name: string
	last_name: string
	middle: string
	books: IBook[]
	id: string
}

export interface IBook extends IBase {
	description: string
	authors: IAuthor[]
	available: number
	copies: number
	title: string
	isbn: string
}

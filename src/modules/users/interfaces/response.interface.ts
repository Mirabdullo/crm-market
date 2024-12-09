export declare interface UserRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: UserRetriveResponse[]
}

export declare interface UserRetriveResponse {
	id: string
	name: string
	phone: string
	debt: number
	lastSale?: Date
	createdAt: Date
}

export declare interface UserResponse {
	id: string
	name: string
	phone: string
	createdAt: Date
}

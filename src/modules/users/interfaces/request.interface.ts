import { Response } from 'express'

export declare interface UserCreateRequest {
	name: string
	phone: string
}

export declare interface UserUpdateRequest {
	id: string
	name?: string
	phone?: string
}

export declare interface UserDeleteRequest {
	id: string
}

export declare interface UserRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	type?: string
	pagination?: boolean
}

export declare interface UserRetriveRequest {
	id: string
}

export declare interface UserDeedRetrieveRequest {
	id: string
	type: string
	res: Response
	startDate?: string
	endDate?: string
}

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

export enum DebtTypeEnum {
	equal = 'equal',
	greater = 'greater',
	less = 'less',
}
export declare interface UserRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	type?: string
	pagination?: boolean
	orderBy?: string
	debt?: number
	debtType?: DebtTypeEnum
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

export declare interface ClientUploadRequest {
	res: Response
	type?: string
}

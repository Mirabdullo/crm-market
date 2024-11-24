export declare interface AdminRetriveAllResponse {
    pageSize: number
    pageNumber: number
    pageCount: number
    totalCount: number
    data: AdminRetriveResponse[]
}

export declare interface AdminRetriveResponse {
    id: string
    name: string
	phone: string
	role: string
	createdAt: Date
	permissions?: AdminPermissions[]
}

export declare interface AdminPermissions {
	id: string
	name: string
}
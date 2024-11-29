export declare interface PermissionRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: PermissionRetriveResponse[]
}

export declare interface PermissionRetriveResponse {
	id: string
	name: string
}

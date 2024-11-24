export declare interface PermissionCreateRequest {
	name: string
	role_id: string
}

export declare interface PermissionUpdateRequest { 
	id: string 
	name?: string
}

export declare interface PermissionDeleteRequest { 
	id: string 
}

export declare interface PermissionRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
}

export declare interface PermissionRetriveRequest {
	id: string
}
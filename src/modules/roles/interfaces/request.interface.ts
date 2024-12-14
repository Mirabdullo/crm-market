export declare interface RoleCreateRequest {
	name: string
	key: string
}

export declare interface RoleUpdateRequest {
	id: string
	key?: string
	name?: string
}

export declare interface RoleDeleteRequest {
	id: string
}

export declare interface RoleRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
	pagination?: boolean
}

export declare interface RoleRetriveRequest {
	id: string
}

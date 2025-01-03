export declare interface AdminCreateRequest {
	name: string
	phone: string
	password: string
	permissions: string[]
}

export declare interface AdminUpdateRequest {
	id: string
	name?: string
	phone?: string
	password?: string
	connectPermissions?: string[]
	disconnectPermissions?: string[]
}

export declare interface AdminDeleteRequest {
	id: string
}

export declare interface AdminRetriveAllRequest {
	pageSize?: number
	pageNumber?: number
	search?: string
}

export declare interface AdminRetriveRequest {
	id: string
}

export declare interface AdminProfileRetriveRequest {
	userId: string
}

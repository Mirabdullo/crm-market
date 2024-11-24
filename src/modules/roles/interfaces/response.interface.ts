export declare interface RoleRetriveAllResponse {
    pageSize: number
    pageNumber: number
    pageCount: number
    totalCount: number
    data: RoleRetriveResponse[]
}

export declare interface RoleRetriveResponse {
    id: string
    name: string
}
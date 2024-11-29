import { AdminRetriveResponse } from '../../admins'

export declare interface AdminSignInRequest {
	phone: string
	password: string
}

export declare interface AdminSignInResponse {
	data: AdminRetriveResponse
	accessToken: string
}

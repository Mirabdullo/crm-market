import { AdminResponse } from '../../admins'
import { OrderProductRetriveResponse } from '../../order-products'
import { PaymentResponse } from '../../payment'
import { UserResponse, UserRetriveResponse } from '../../users'

export declare interface OrderRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: OrderRetriveResponse[]
}

export declare interface OrderRetriveResponse {
	id: string
	articl: number
	sum: number
	accepted: boolean
	createdAt: Date
	client: UserResponse
	seller: AdminResponse
	payment: PaymentResponse
	products: OrderProductRetriveResponse[]
}

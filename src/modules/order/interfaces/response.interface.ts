import { AdminResponse } from '../../admins'
import { OrderProductRetriveResponse } from '../../order-products'
import { PaymentResponse } from '../../payment'
import { UserRetriveResponse } from '../../users'

export declare interface OrderRetriveAllResponse {
	pageSize: number
	pageNumber: number
	pageCount: number
	totalCount: number
	data: OrderRetriveResponse[]
}

export declare interface OrderRetriveResponse {
	id: string
	sum: number
	accepted: boolean
	createdAt: Date
	client: UserRetriveResponse
	admin: AdminResponse
	payment: PaymentResponse
	orderProducts: OrderProductRetriveResponse[]
}

import { SetMetadata } from '@nestjs/common'
import { PERMISSION } from '../constants'

export const Permission = (permission: string) => SetMetadata(PERMISSION, permission)

import { endOfDay, format, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const timeZone = 'UTC'

export const getStartDate = (date: Date | string) => {
	const zonedTime = toZonedTime(date, timeZone)
	return format(startOfDay(zonedTime), "yyyy-MM-dd'T'HH:mm:ss.SSSX")
}

export const getEndDate = (date: Date | string) => {
	const zonedTime = toZonedTime(date, timeZone)
	return format(endOfDay(zonedTime), "yyyy-MM-dd'T'HH:mm:ss.SSSX")
}

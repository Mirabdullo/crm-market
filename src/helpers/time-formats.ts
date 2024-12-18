import { endOfDay, format, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const timeZone = 'UTC'

export const getStartDate = (date: Date) => {
	console.log(date)
	const zonedTime = toZonedTime(date, timeZone)
	console.log(zonedTime)
	return format(endOfDay(zonedTime), "yyyy-MM-dd'T'HH:mm:ss.SSSX")
}

export const getEndDate = (date: Date) => {
	const zonedTime = toZonedTime(date, timeZone)
	return format(endOfDay(zonedTime), "yyyy-MM-dd'T'HH:mm:ss.SSSX")
}

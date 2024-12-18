import { endOfDay, format, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const timeZone = 'UTC'

export const getStartDate = (date: string) => {
	console.log(date)
	const zonedTime = toZonedTime(date, timeZone)
	console.log(zonedTime, format(startOfDay(zonedTime), "yyyy-MM-dd'T'HH:mm:ss.SSSX"))
	return startOfDay(zonedTime)
}

export const getEndDate = (date: string) => {
	const zonedTime = toZonedTime(date, timeZone)
	return endOfDay(zonedTime)
}

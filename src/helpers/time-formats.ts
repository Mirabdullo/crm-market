import { endOfDay, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const timeZone = 'UTC'

export const getStartDate = (date: Date) => {
	const zonedTime = toZonedTime(date, timeZone)
	return startOfDay(zonedTime)
}

export const getEndDate = (date: Date) => {
	const zonedTime = toZonedTime(date, timeZone)
	return endOfDay(zonedTime)
}

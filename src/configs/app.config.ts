declare interface AppConfigOptions {
	host: string
	port: number
}
export const appConfig: AppConfigOptions = {
	host: process.env.APP_HOST ?? '127.0.0.1',
	port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000,
}

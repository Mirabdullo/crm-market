export declare interface JwtConfigOptions {
	accessToken: { key: string; time: string }
	// refreshToken: { key: string; time: string }
}

export const JwtConfig: JwtConfigOptions = {
	accessToken: {
		key: process.env.ACCESS_TOKEN_KEY,
		time: process.env.ACCESS_TOKEN_TIME,
	},
	// refreshToken: {
	// 	key: process.env.REFRESH_TOKEN_KEY,
	// 	time: process.env.REFRESH_TOKEN_TIME,
	// },
}

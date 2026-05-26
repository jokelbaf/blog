declare module '#auth-utils' {
	interface User {
		id: number;
		login: string;
		name: string;
		avatarUrl: string;
		isAdmin: boolean;
	}
}

export {};

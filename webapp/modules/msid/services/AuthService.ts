import { siteConfig } from "@/config/site";
import axios from "axios";

class AuthService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: `${siteConfig.backendUrl}/auth` })
	) {}

	async claim(username: string, owner: string, message: string, expiration: number): Promise<void> {
		try {
			await this.httpClient.post("/claim", { username, owner, message, expiration });
		} catch (err) {
			throw err;
		}
	}

	async getJWT(username: string, message: string, expiration: number): Promise<string> {
		try {
			const response = await this.httpClient.post("/jwt", { username, message, expiration });
			return response.data.token;
		} catch (err) {
			throw err;
		}
	}

	async pre(address: string): Promise<{ claimed: boolean, username?: string }> {
		try {
			const response = await this.httpClient.post("/pre", { address });
			return response.data;
		} catch (err) {
			throw err;
		}
	}

	async sign(username: string, owner: string): Promise<{ claimed: boolean, signature: string; signatureExpiration: bigint }> {
		try {
			const { data } = await this.httpClient.post("/sign", { username, owner });
			return data;
		} catch (err) {
			throw err;
		}
	}
}

export const authService = new AuthService();
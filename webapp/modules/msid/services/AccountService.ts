import { siteConfig } from "@/config/site";
import axios from "axios";

class AccountService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: `${siteConfig.backendUrl}/account` })
	) {}

	async getInfo(jwt: string): Promise<{ discord: any, referralCount: number }> {
		try {
			const response = await this.httpClient.get("/info", {
				headers: {
					Authorization: `Bearer ${jwt}`
				}
			});
			return response.data;
		} catch (err) {
			throw err;
		}
	}

	async linkDiscord(code: string, redirectUri: string, jwt: string): Promise<void> {
		try {
			await this.httpClient.post("/discord", { code, redirectUri }, {
				headers: {
					Authorization: `Bearer ${jwt}`
				}
			});
		} catch (err) {
			throw err;
		}
	}

	async ping(address: string, referrer?: string): Promise<{ message: string }> {
		try {
			const response = await this.httpClient.post("/ping", { address, referrer });
			return response.data;
		} catch (err) {
			throw err;
		}
	}
}

export const accountService = new AccountService();
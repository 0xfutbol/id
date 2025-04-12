import axios from "axios";

import { backendUrl } from "@/config";
import { getSavedJWT } from "@/utils";

class AccountService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: `${backendUrl}/account` })
	) {}

	async getInfo(): Promise<{ discord: any, referralCount: number }> {
		try {
			const response = await this.httpClient.get("/info", {
				headers: {
					Authorization: `Bearer ${getSavedJWT()}`
				}
			});
			return response.data;
		} catch (err) {
			throw err;
		}
	}

	async linkDiscord(code: string, redirectUri: string): Promise<void> {
		try {
			await this.httpClient.post("/discord", { code, redirectUri }, {
				headers: {
					Authorization: `Bearer ${getSavedJWT()}`
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
import { siteConfig } from "@/config/site";
import axios from "axios";

class AccountService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: `${siteConfig.backendUrl}/account` })
	) {}

	async ping(address: string): Promise<{ message: string }> {
		try {
			const response = await this.httpClient.post("/ping", { address });
			return response.data;
		} catch (err) {
			throw err;
		}
	}
}

export const accountService = new AccountService();
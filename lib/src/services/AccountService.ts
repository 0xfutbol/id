import axios, { AxiosInstance } from "axios";

import { getSavedJWT } from "@/utils";

export class AccountService {
	private readonly httpClient: AxiosInstance;

	constructor(
		backendUrl: string
	) {
		this.httpClient = axios.create({ baseURL: `${backendUrl}/account` })
	}

	// Public read methods (no authentication required)
	async ping(address: string, referrer?: string): Promise<{ message: string }> {
		try {
			const response = await this.httpClient.post("/ping", { address, referrer });
			return response.data;
		} catch (err) {
			throw err;
		}
	}

	async getPublicAccountInfoByUsername(username: string): Promise<{ address: string, discord: string | null, pip: string | null, username: string }> {
		try {
			const response = await this.httpClient.get(`/username/${username}`);
			return response.data;
		} catch (err) {
			throw err;
		}
	}

	async resolveAddressToUsername(address: string): Promise<{ username: string }> {
		try {
			const response = await this.httpClient.get(`/resolve/${address}`);
			return response.data;
		} catch (err) {
			throw err;
		}
	}

	// Private read methods (authentication required)
	async getInfo(): Promise<{ discord: any, pip: string | null, referralCount: number }> {
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

	// Mutation methods (authentication required)
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

	async updatePiP(tokenId: string): Promise<void> {
		try {
			await this.httpClient.post("/pip", { tokenId }, {
				headers: {
					Authorization: `Bearer ${getSavedJWT()}`
				}
			});
		} catch (err) {
			throw err;
		}
	}
}

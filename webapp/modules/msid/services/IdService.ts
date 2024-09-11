import { siteConfig } from "@/config/site";
import axios from "axios";

class IdService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: siteConfig.backendUrl })
	) {}

	async claimSignature(username: string, owner: string): Promise<{ claimed: boolean, signature: string; signatureExpiration: bigint }> {
		try {
			const { data } = await this.httpClient.post("/auth/claim", { username, owner });
			return data;
		} catch (err) {
			throw err;
		}
	}

	async getClaimJWT(username: string, signature: string, signatureExpiration: bigint, jwtExpiration: number): Promise<string> {
		try {
			const response = await this.httpClient.post("/auth/jwt", { username, message: `CLAIM:${signature}.${signatureExpiration}`, expiration: jwtExpiration });
			return response.data.token;
		} catch (err) {
			throw err;
		}
	}

	async getJWT(username: string, message: string, expiration: number): Promise<string> {
		try {
			const response = await this.httpClient.post("/auth/jwt", { username, message, expiration });
			return response.data.token;
		} catch (err) {
			throw err;
		}
	}

	async pre(address: string): Promise<{ claimed: boolean, username?: string }> {
		try {
			const response = await this.httpClient.post("/auth/pre", { address });
			return response.data;
		} catch (err) {
			throw err;
		}
	}
}

export const idService = new IdService();
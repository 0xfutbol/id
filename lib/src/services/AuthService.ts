import axios, { AxiosInstance } from "axios";

export class AuthService {
	private readonly httpClient: AxiosInstance;

	constructor(
		backendUrl: string
	) {
		this.httpClient = axios.create({ baseURL: `${backendUrl}/auth` })
	}

	async claim(username: string, owner: string, message: string, signatureExpiration: number, userDetails?: Record<string, any>, userEmail?: string): Promise<void> {
		try {
			await this.httpClient.post("/claim", { username, owner, message, expiration: signatureExpiration, userDetails, userEmail });
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

	async registerPassword(username: string, password: string): Promise<{
		token: string;
		address: string;
		walletId: string;
		walletAddress: string;
		waasSessionToken?: string;
		waasSessionExpiresAt?: number;
	}> {
		const { data } = await this.httpClient.post("/register/password", { username, password });
		return data;
	}

	async loginPassword(username: string, password: string): Promise<{
		token: string;
		address: string;
		walletId?: string;
		walletAddress?: string;
		waasSessionToken?: string;
		waasSessionExpiresAt?: number;
	}> {
		const { data } = await this.httpClient.post("/login/password", { username, password });
		return data;
	}
}

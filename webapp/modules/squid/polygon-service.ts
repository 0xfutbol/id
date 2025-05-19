import { Pack } from "@/modules/squid/types";
import axios from "axios";

class PolygonService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: "https://squid-polygon.metasoccer.com/api" })
	) {}

	async queryLands(owner: string): Promise<any> {
		try {
			const { data } = await this.httpClient.post("/graphql", {
				query: `
					query($owner: String!) {
						lands(where: {owner_containsInsensitive: $owner}) {
							id
						}
					}
				`,
				variables: { owner }
			});
			return data.data.lands;
		} catch (err) {
			throw err;
		}
	}

	async queryPacks(owner: string): Promise<Pack[]> {
		try {
			const { data } = await this.httpClient.post("/graphql", {
				query: `
					query($owner: String!) {
						packs(where: {owner_containsInsensitive: $owner}) {
							id
							rarity
						}
					}
				`,
				variables: { owner }
			});
			return data.data.packs.map((pack: any) => ({
				...pack,
				chain: "matchain"
			}));
		} catch (err) {
			throw err;
		}
	}

	async queryPlayers(owner: string): Promise<any> {
		try {
			const { data } = await this.httpClient.post("/graphql", {
				query: `
					query($owner: String!) {
						players(where: {owner_containsInsensitive: $owner}) {
							id
						}
					}
				`,
				variables: { owner }
			});
			return data.data.players;
		} catch (err) {
			throw err;
		}
	}

	async queryScouts(owner: string): Promise<any> {
		try {
			const { data } = await this.httpClient.post("/graphql", {
				query: `
					query($owner: String!) {
						scouts(where: {owner_containsInsensitive: $owner}) {
							id
						}
					}
				`,
				variables: { owner }
			});
			return data.data.scouts;
		} catch (err) {
			throw err;
		}
	}
}

export const polygonService = new PolygonService();

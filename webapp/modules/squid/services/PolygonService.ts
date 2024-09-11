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
						lands(where: {owner_eq: $owner}) {
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

	async queryPlayers(owner: string): Promise<any> {
		try {
			const { data } = await this.httpClient.post("/graphql", {
				query: `
					query($owner: String!) {
						players(where: {owner_eq: $owner}) {
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
						scouts(where: {owner_eq: $owner}) {
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

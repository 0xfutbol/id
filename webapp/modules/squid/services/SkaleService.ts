import axios from "axios";

class SkaleService {
	constructor(
		private readonly httpClient = axios.create({ baseURL: "https://squid.metasoccer.com/api" })
	) {}

	async queryClubs(owner: string): Promise<any> {
		try {
			const { data } = await this.httpClient.post("/graphql", {
				query: `
					query($owner: String!) {
						metaSoccerClubs(where: {owner_containsInsensitive: $owner}) {
							id
						}
					}
				`,
				variables: { owner }
			});
			return data.data.metaSoccerClubs;
		} catch (err) {
			throw err;
		}
	}
}

export const skaleService = new SkaleService();

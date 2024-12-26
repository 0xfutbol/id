import axios from 'axios';
import { keccak256, toUtf8Bytes } from 'ethers';
import { getUserByUsername } from '../repo/db';

export async function getOxFutbolIdByUsername(username: string, maxWaitSeconds: number = 0): Promise<{ owner: string } | null> {
  const usernameHash = keccak256(toUtf8Bytes(username));
  let totalWaitSeconds = 0;

  while (true) {
    const { data } = await axios.post("https://squid.metasoccer.com/api/graphql", {
      query: `{ metaSoccerIds(where: { id_eq: "${usernameHash}" }) { owner } }`,
    });

    const metaSoccerIds = data.data.metaSoccerIds;

    if (metaSoccerIds.length > 0 || totalWaitSeconds >= maxWaitSeconds) {
      if (metaSoccerIds.length > 0) {
        const user = await getUserByUsername(username);
        return {
          ...metaSoccerIds[0],
          owner: user!.address,
        };
      }
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
    totalWaitSeconds += 2;
  }
}

export async function getOxFutbolIdByOwner(owner: string): Promise<{ id: string } | null> {
  const { data } = await axios.post("https://squid.metasoccer.com/api/graphql", {
    query: `{ metaSoccerIds(where: { owner_containsInsensitive: "${owner}" }) { id } }`,
  });

  return data.data.metaSoccerIds[0];
}


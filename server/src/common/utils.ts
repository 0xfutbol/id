import axios from 'axios';
import { keccak256, toUtf8Bytes } from 'ethers';
import { getUsername, saveUsernameIfItDoesntExists } from '../repo/db';
import { validateUsernameWithAI } from './openai';

export async function getMetaSoccerIdByUsername(username: string, maxWaitSeconds: number = 0): Promise<any[]> {
  const usernameHash = keccak256(toUtf8Bytes(username));
  let totalWaitSeconds = 0;

  while (true) {
    const { data } = await axios.post("https://squid.metasoccer.com/api/graphql", {
      query: `{ metaSoccerIds(where: { id_eq: "${usernameHash}" }) { owner } }`,
    });

    const metaSoccerIds = data.data.metaSoccerIds;

    if (metaSoccerIds.length > 0 || totalWaitSeconds >= maxWaitSeconds) {
      return metaSoccerIds;
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
    totalWaitSeconds += 2;
  }
}

export async function getMetaSoccerIdByOwner(owner: string): Promise<any[]> {
  const { data } = await axios.post("https://squid.metasoccer.com/api/graphql", {
    query: `{ metaSoccerIds(where: { owner_eq: "${owner}" }) { id } }`,
  });

  return data.data.metaSoccerIds;
}

export async function validateUsername(username: string): Promise<{ isValid: boolean; error?: string }> {
  const trimmedUsername = username.trim();

  if (!isValidSubdomain(trimmedUsername)) {
    await saveUsernameIfItDoesntExists(trimmedUsername, false);
    return { isValid: false, error: 'Invalid username' };
  }

  let usernameData = await getUsername(trimmedUsername);
  if (!usernameData) {
    const isValid = await validateUsernameWithAI(trimmedUsername);
    await saveUsernameIfItDoesntExists(trimmedUsername, isValid);
    usernameData = { username: trimmedUsername, is_valid: isValid };
  }

  if (!usernameData.is_valid) {
    return { isValid: false, error: 'Invalid username' };
  }

  if ((await getMetaSoccerIdByUsername(trimmedUsername)).length > 0) {
    return { isValid: false, error: 'Username already exists' };
  }

  return { isValid: true };
}

export function isValidSubdomain(username: string): boolean {
  const subdomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;
  return subdomainRegex.test(username);
}
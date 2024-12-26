import axios from 'axios';
import { keccak256, toUtf8Bytes } from 'ethers';
import { getUsername, saveUsernameIfItDoesntExists } from '../repo/db';
import { validateUsernameWithAI } from './openai';

const offensiveWords: string[] = [
  "idiot", "moron", "stupid", "dumb", "asshole", "bastard", 
  "bitch", "slut", "whore", "fuck", "shit", "piss", "cunt", 
  "dick", "cock", "nigger", "faggot", "spic", "wetback", "dyke", 
  "twat", "wanker", "tosser", "prick", "bugger", "bollocks", 
  "bloody", "wog", "cocksucker", "motherfucker", "pussy", "jerk", 
  "retard", "cripple", "spaz", "tranny", "queer", "homo", "chink", 
  "gook", "nip", "kike", "raghead", "camel jockey", "terrorist", 
  "freak", "whorehouse", "drug addict", "junkie", "meth head"
];

const soccerTeams: string[] = [
  "manchester united", "real madrid", "barcelona", "liverpool", "chelsea", 
  "bayern munich", "juventus", "psg", "manchester city", "arsenal", 
  "tottenham", "inter milan", "ac milan", "atletico madrid", "roma", 
  "napoli", "ajax", "porto", "benfica", "borussia dortmund", 
  "sevilla", "valencia", "monaco", "lyon", "galatasaray", 
  "fenerbahce", "besiktas", "rangers", "celtic", "leicester city", 
  "everton", "west ham", "aston villa", "newcastle united", 
  "leeds united", "wolverhampton wanderers", "crystal palace", "southampton"
];

const wellKnownAthletes: string[] = [
  "messi", "ronaldo", "neymar", "mbappe", "zlatan", "lewandowski", 
  "benzema", "modric", "salah", "haaland", "kane", "aguero", 
  "pulisic", "son", "ramos", "pogba", "de bruyne", "griezmann", 
  "sterling", "suarez", "alisson", "ter stegen", "van dijk", "robertson", 
  "kante", "hazard", "donnarumma", "courtois", "chiellini", "dani alves", 
  "pirlo", "xavi", "iniesta", "buffon", "schweinsteiger", "maradona", 
  "pele", "ronaldinho", "maldini", "figo", "henry", "shevchenko"
];

export async function getOxFutbolIdByUsername(username: string, maxWaitSeconds: number = 0): Promise<any[]> {
  const usernameHash = keccak256(toUtf8Bytes(username));
  let totalWaitSeconds = 0;

  while (true) {
    const { data } = await axios.post("https://squid.metasoccer.com/api/graphql", {
      query: `{ metaSoccerIds(where: { id_eq: "${usernameHash}" }) { owner } }`,
    });

    const oxFutbolIds = data.data.oxFutbolIds;

    if (oxFutbolIds.length > 0 || totalWaitSeconds >= maxWaitSeconds) {
      return oxFutbolIds;
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
    totalWaitSeconds += 2;
  }
}

export async function getOxFutbolIdByOwner(owner: string): Promise<any[]> {
  const { data } = await axios.post("https://squid.metasoccer.com/api/graphql", {
    query: `{ metaSoccerIds(where: { owner_containsInsensitive: "${owner}" }) { id } }`,
  });

  return data.data.oxFutbolIds;
}

export async function validateUsername(username: string): Promise<{ isValid: boolean; error?: string }> {
  const trimmedUsername = username.trim();

  if (!isValidSubdomain(trimmedUsername)) {
    await saveUsernameIfItDoesntExists(trimmedUsername, false);
    return { isValid: false, error: 'Invalid username format. Username must start and end with alphanumeric characters, can contain hyphens, and be between 3 and 63 characters long.' };
  }

  let isValid = false;
  let usernameData = await getUsername(trimmedUsername);
  if (!usernameData) {
    try {
      isValid = await validateUsernameWithAI(trimmedUsername);
      await saveUsernameIfItDoesntExists(trimmedUsername, isValid);
    } catch (error) {
      console.error('Error validating username with AI:', error);
      isValid = heuristicsValidation(trimmedUsername);
      await saveUsernameIfItDoesntExists(trimmedUsername, isValid);
    }
    usernameData = { username: trimmedUsername, is_valid: isValid };
  }

  if (!usernameData.is_valid) {
    return { isValid: false, error: 'Username contains inappropriate content or violates our guidelines. Please choose a different username.' };
  }

  if ((await getOxFutbolIdByUsername(trimmedUsername)).length > 0) {
    return { isValid: false, error: 'Username is already registered in the MetaSoccer system. Please choose a different username.' };
  }

  return { isValid: true };
}

function heuristicsValidation(username: string): boolean {
  const lowerCaseUsername = username.toLowerCase();

  // Check for offensive words
  for (const profanity of offensiveWords) {
    if (lowerCaseUsername.includes(profanity)) {
      return false;
    }
  }

  // Check for soccer clubs
  for (const club of soccerTeams) {
    if (lowerCaseUsername.includes(club)) {
      return false;
    }
  }

  // Check for well-known athletes
  for (const athlete of wellKnownAthletes) {
    if (lowerCaseUsername.includes(athlete)) {
      return false;
    }
  }

  // Check for contact information (email or phone number)
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phonePattern = /\b\d{10,}\b/;
  
  if (emailPattern.test(lowerCaseUsername) || phonePattern.test(lowerCaseUsername)) {
    return false;
  }

  // If no issues are found, the username is valid
  return true;
}

export function isValidSubdomain(username: string): boolean {
  const subdomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;
  return subdomainRegex.test(username);
}
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();

export const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    ssl: { rejectUnauthorized: false },
  },
});

// Address-related methods
export async function getAddress(address: string): Promise<{ address: string; referrer?: string } | undefined> {
  const result = await db('addresses')
    .select('address', 'referrer')
    .where('address', address.toLowerCase())
    .first();
  return result;
}

export async function saveAddress(address: string, referrer?: string): Promise<void> {
  await db('addresses').insert({
    address: address.toLowerCase(),
    referrer: referrer?.toLowerCase(),
  }).onConflict('address').merge();
}

export async function getReferralCount(referrer: string): Promise<number> {
  const result = await db('addresses')
    .count('address as count')
    .where('referrer', referrer.toLowerCase())
    .first();
  return parseInt(result?.count as string) || 0;
}

// User-related methods
export async function getUserByAddress(address: string): Promise<{ address: string; username: string; login_method?: string } | undefined> {
  const result = await db('users')
    .select('address', 'username', 'login_method')
    .where('address', address.toLowerCase())
    .first();
  return result;
}

export async function saveUserIfDoesntExists(address: string, username: string, login_method?: string): Promise<void> {
  const existingUser = await db('users').where({ username }).first();
  if (!existingUser) {
    await db('users').insert({ id: randomUUID(), address: address.toLowerCase(), username, login_method });
  }
}

// Username-related methods
export async function getUsername(username: string): Promise<{ username: string; is_valid: boolean } | undefined> {
  const result = await db('usernames')
    .select('username', 'is_valid')
    .where('username', username)
    .first();
  return result;
}

export async function saveUsernameIfItDoesntExists(username: string, isValid: boolean): Promise<void> {
  const existingUsername = await db('usernames').where({ username }).first();
  if (!existingUsername) {
    await db('usernames').insert({
      username,
      is_valid: isValid,
    }).onConflict('username').merge();
  }
}

// Discord-related methods
export async function getDiscordAccountByDiscordId(discordId: string): Promise<{ discord_id: string; address: string; info: any } | undefined> {
  const result = await db('discord_accounts')
    .select('discord_id', 'address', 'info')
    .where('discord_id', discordId)
    .first();
  return result;
}

export async function getDiscordAccountByAddress(address: string): Promise<{ discord_id: string; address: string; info: any } | undefined> {
  const result = await db('discord_accounts')
    .select('discord_id', 'address', 'info')
    .where('address', address.toLowerCase())
    .first();
  return result;
}

export async function saveDiscordAccount(discordId: string, address: string, info: any): Promise<void> {
  await db('discord_accounts').insert({
    discord_id: discordId,
    address: address.toLowerCase(),
    info: JSON.stringify(info),
  }).onConflict('address').merge();
}
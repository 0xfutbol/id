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
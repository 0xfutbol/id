import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { Wallet } from 'ethers';
import { oxFutboId } from '../utils/common/id';
import {
  getIdentityByUsername,
  saveIdentity,
  saveUserIfDoesntExists,
  updateIdentityWallet,
} from '../models/db';
import walletClient from '../utils/common/walletClient';
import waasClient from '../utils/common/waasClient';
import { validateUsername } from '../utils/common/utils';

const PASSWORD_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 1 << 16, // 64MB
    parallelism: 1,
  });

const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);

async function ensureIdentityNotTaken(username: string) {
  const existing = await getIdentityByUsername(username);
  if (existing) {
    throw new Error('Username already registered');
  }
}

function buildPasswordJwt(username: string, address: string) {
  const expiration = Math.floor(Date.now() / 1000) + PASSWORD_TOKEN_TTL_SECONDS;
  const message = 'password-login';
  return oxFutboId.createJWT(username, address, message, expiration, {
    loginMethod: 'MetaSoccer',
  });
}

async function provisionWallet(address: string, username: string, privateKey: string) {
  // Prefer WaaS; fallback to legacy client if configured
  if (process.env.WAAS_BASE_URL) {
    return waasClient.createWallet({
      ownerId: address,
      ownerType: 'MS',
      chainName: 'base',
      meta: { username, loginMethod: 'MetaSoccer' },
      privateKey,
    });
  }

  return walletClient.createWallet({
    ownerId: address,
    ownerType: 'MS',
    chainName: 'base',
    meta: { username, loginMethod: 'MetaSoccer' },
    privateKey,
  });
}

const identityService = {
  async register(username: string, password: string) {
    const validation = await validateUsername(username);
    if (!validation.isValid) {
      throw new Error(validation.error ?? 'Invalid username');
    }
    await ensureIdentityNotTaken(username);

    const userWallet = Wallet.createRandom();
    const address = userWallet.address.toLowerCase();

    const wallet = await provisionWallet(address, username, userWallet.privateKey);

    const passwordHash = await hashPassword(password);

    await saveIdentity({
      id: randomUUID(),
      username,
      passwordHash,
      address,
      loginMethod: 'MetaSoccer',
    });

    await saveUserIfDoesntExists(address, username, 'MetaSoccer');
    await updateIdentityWallet(username, wallet.id, wallet.address);

    const token = buildPasswordJwt(username, address);

    return { token, address, wallet };
  },

  async login(username: string, password: string) {
    const identity = await getIdentityByUsername(username);
    if (!identity) {
      throw new Error('Invalid credentials');
    }

    const ok = await verifyPassword(identity.password_hash, password);
    if (!ok) {
      throw new Error('Invalid credentials');
    }

    const token = buildPasswordJwt(username, identity.address);
    return { token, address: identity.address, walletId: identity.wallet_id, walletAddress: identity.wallet_address };
  },
};

export default identityService;

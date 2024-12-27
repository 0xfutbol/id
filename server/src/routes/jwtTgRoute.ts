import { MAX_SIGNATURE_EXPIRATION } from '@0xfutbol/id';
import { createHmac } from 'crypto';
import { keccak256, toUtf8Bytes, Wallet } from 'ethers';
import express from 'express';
import { oxFutboId } from '../common/id';
import { provider } from '../common/web3';
import { getTelegramAccountByTelegramId, saveTelegramAccount } from '../repo/db';

interface InitData {
  user: TelegramUser;
  chat_instance: string;
  chat_type: string;
  auth_date: number;
  hash: string;
  signature: string;
};

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
  allows_write_to_pm: boolean;
  photo_url: string;
}

const jwtTgRouter = express.Router();

const botToken = process.env.TELEGRAM_BOT_TOKEN!;

jwtTgRouter.post('/jwt/tg', express.json(), async (req: express.Request & { initDataRaw?: string }, res) => {
  const { initDataRaw } = req.body;

  if (!initDataRaw) {
    return res.status(400).json({ message: "Init data missing" });
  }

  if (!isTelegramInitDataValid(initDataRaw)) {
    return res.status(400).json({ message: "Init data is invalid" });
  }

  const initData = JSON.parse(initDataRaw) as InitData;

  const username = `telegram:${initData.user.id}`;
  const privateKey = keccak256(toUtf8Bytes(`0xFútbolID:${username}`));
  const owner = new Wallet(privateKey, provider).address;

  try {
    const existingTelegramAccount = await getTelegramAccountByTelegramId(initData.user.id);

    if (!existingTelegramAccount) {
      await saveTelegramAccount(initData.user.id, initData.user);
    }

    const token = oxFutboId.createJWT(username, owner, initData.signature, MAX_SIGNATURE_EXPIRATION, initData.user);

    return res.json({ token });
  } catch (error) {
    console.error('Error in claim route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const isTelegramInitDataValid = (initDataRaw: string): boolean => {
  const initData = new URLSearchParams(initDataRaw);
  const hashFromClient = initData.get('hash');
  const dataToCheck: string[] = [];

  initData.sort();
  initData.forEach((v, k) => k !== 'hash' && dataToCheck.push(`${k}=${v}`));

  const secret = createHmac('sha256', 'WebAppData')
    .update(botToken);

  const signature = createHmac('sha256', secret.digest())
    .update(dataToCheck.join('\n'));

  const referenceHash = signature.digest('hex');

  return hashFromClient === referenceHash;
};

export default jwtTgRouter;
import { MAX_SIGNATURE_EXPIRATION } from '@0xfutbol/id';
import { parse, validate } from '@telegram-apps/init-data-node';
import { keccak256, toUtf8Bytes, Wallet } from 'ethers';
import express from 'express';
import { oxFutboId } from '../common/id';
import { provider } from '../common/web3';
import { getTelegramAccountByTelegramId, saveTelegramAccount } from '../repo/db';

const jwtTgRouter = express.Router();

function getBotToken(environment: string) {
  if (environment === 'local') {
    return process.env.TELEGRAM_BOT_TOKEN_LOCAL!;
  }
  if (environment === 'dev') {
    return process.env.TELEGRAM_BOT_TOKEN_DEV!;
  }
  return process.env.TELEGRAM_BOT_TOKEN!;
}

jwtTgRouter.post('/jwt/tg', express.json(), async (req: express.Request & { initDataRaw?: string }, res) => {
  const { environment, initDataRaw } = req.body;

  if (!initDataRaw) {
    return res.status(400).json({ message: "Init data missing" });
  }

  if (!isTelegramInitDataValid(environment, initDataRaw)) {
    return res.status(400).json({ message: "Init data is invalid" });
  }

  const initData = parse(initDataRaw);

  if (!initData.user) {
    return res.status(400).json({ message: "User is missing" });
  }

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

export const isTelegramInitDataValid = (environment: string, initDataRaw: string): boolean => {
  try {
    const botToken = getBotToken(environment);
    validate(initDataRaw, botToken);
    return true;
  } catch (error) {
    console.error('Error in isTelegramInitDataValid:', error);
    return false;
  }
};

export default jwtTgRouter;

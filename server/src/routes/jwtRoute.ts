import { verifyMessage, verifyTypedData, Wallet } from 'ethers';
import express from 'express';
import jwt from 'jsonwebtoken';
import { getMetaSoccerIdByUsername } from '../common/utils';
import { saveUserIfDoesntExists } from '../repo/db';
import { getDomain, getTypes } from './claimRoute';

const jwtRouter = express.Router();

const AUTH_MESSAGE = 'Authenticate with MetaSoccerID\n\nID: {username}\n\nExpiration: {expiration}';
const MAX_SIGNATURE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;  // 7 days

jwtRouter.post('/jwt', express.json(), async (req, res) => {
  const { username, loginMethod, message, expiration } = req.body;

  if (!isValidRequest(username, message, expiration)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  if (!isValidSignatureExpiration(expiration)) {
    return res.status(400).json({ error: 'Signature expired or too far in the future' });
  }

  try {
    const metaSoccerIds = await getMetaSoccerIdByUsername(username, 60);

    if (metaSoccerIds.length === 0) {
      return res.status(404).json({ error: 'MetaSoccerID not found' });
    }

    if (message.startsWith('CLAIM:')) {
      await validateClaimSignature(message, metaSoccerIds, username);
    } else {
      await validateUserSignature(message, metaSoccerIds, username, expiration);
    }

    const owner = metaSoccerIds[0].owner;
    const token = createJWT(username, owner, message, expiration);
    
    // Save the user in the database
    await saveUserIfDoesntExists(owner, username, loginMethod ?? "unknown");

    const host = req.get('host');
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

    // Set the secure cookie
    res.cookie('auth_token', token, {
      httpOnly: !isLocalhost,
      secure: !isLocalhost,
      sameSite: 'strict',
      domain: isLocalhost ? 'localhost' : '.metasoccer.com',
      maxAge: MAX_SIGNATURE_EXPIRATION,
    });

    // Return the token in the JSON response as well
    res.json({ token });
  } catch (error) {
    console.error('Error creating JWT:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function isValidRequest(username: string, signature: string, expiration: number): boolean {
  return Boolean(username && signature && expiration);
}

function isValidSignatureExpiration(expiration: number): boolean {
  const currentTimestamp = Date.now();
  const isValid = expiration - currentTimestamp <= MAX_SIGNATURE_EXPIRATION;
  return isValid;
}

async function validateClaimSignature(message: string, metaSoccerIds: any[], username: string) {
  console.log('Validating claim signature for username:', username);
  const [signature, signatureExpirationStr] = message.slice(6).split(".");
  const signatureExpiration = parseInt(signatureExpirationStr);
  console.log('Parsed signature and expiration:', { signature, signatureExpiration });

  // Validate that signatureExpiration hasn't expired
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (currentTimestamp > signatureExpiration + 60) {
    console.error('Signature has expired');
    throw new Error('Signature expired');
  }

  const privateKey = process.env.ONCHAIN_PRIVATE_KEY;
  const wallet = new Wallet(privateKey!);
  console.log('Created wallet with private key');

  const domain = getDomain();
  const types = getTypes();
  console.log('Got domain and types for EIP-712 signature');

  console.log('Verifying typed data with parameters:', {
    domain,
    types,
    data: { username, owner: metaSoccerIds[0].owner, signatureExpiration },
    signature
  });
  const recoveredAddress = verifyTypedData(
    domain,
    types,
    { username, owner: metaSoccerIds[0].owner, signatureExpiration },
    signature
  );
  console.log('Recovered address:', recoveredAddress);

  if (recoveredAddress !== wallet.address) {
    console.error('Unauthorized: Recovered address does not match wallet address');
    throw new Error('Unauthorized');
  }
  console.log('Claim signature validation successful');
}

async function validateUserSignature(message: string, metaSoccerIds: any[], username: string, expiration: number) {
  const recoveredAddress = verifyMessage(getAuthMessage(username, expiration), message);

  if (!isValidOwner(metaSoccerIds, recoveredAddress)) {
    throw new Error('Unauthorized');
  }
}

function getAuthMessage(username: string, expiration: number): string {
  return AUTH_MESSAGE.replace('{username}', username).replace('{expiration}', expiration.toString());
}

function isValidOwner(metaSoccerIds: any[], recoveredAddress: string): boolean {
  return metaSoccerIds.length > 0 && metaSoccerIds[0].owner.toLowerCase() === recoveredAddress.toLowerCase();
}

function createJWT(username: string, owner: string, signature: string, expiration: number): string {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ username, owner, signature, expiration }, secret!, { expiresIn: expiration });
}

export default jwtRouter;
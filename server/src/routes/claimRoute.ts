import { Wallet } from 'ethers';
import express from 'express';
import { getMetaSoccerIdByOwner, validateUsername } from '../common/utils';

const claimRouter = express.Router();

claimRouter.post('/claim', express.json(), async (req, res) => {
  const { username, owner } = req.body;

  if (!username || !owner) {
    return res.status(400).json({ error: 'Username and owner address are required' });
  }

  // Check if the owner has already claimed a username
  const existingClaims = await getMetaSoccerIdByOwner(owner);
  if (existingClaims.length > 0) {
    return res.status(400).json({ error: 'This address has already claimed a username' });
  }

  const validationResult = await validateUsername(username);
  if (!validationResult.isValid) {
    return res.status(400).json({ error: validationResult.error });
  }

  try {
    const privateKey = process.env.ONCHAIN_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('ONCHAIN_PRIVATE_KEY is not set');
    }
    const wallet = new Wallet(privateKey);
    const domain = getDomain();
    const types = getTypes();
    const signatureExpiration = Math.floor(Date.now() / 1000) + 60; // 1 minute expiration
    const message = { username: username.trim(), owner, signatureExpiration };

    const signature = await wallet.signTypedData(domain, types, message);
    res.json({ signature, signatureExpiration });
  } catch (error) {
    console.error('Error creating claim signature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function getDomain() {
  const chainId = parseInt(process.env.ONCHAIN_CHAIN_ID || '1', 10);
  const contractAddress = process.env.ONCHAIN_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('ONCHAIN_CONTRACT_ADDRESS is not set');
  }
  return {
    name: 'MetaSoccerID',
    version: '1',
    chainId,
    verifyingContract: contractAddress,
  };
}

export function getTypes() {
  return {
    Username: [
      { name: 'username', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'signatureExpiration', type: 'uint256' },
    ],
  };
}

export default claimRouter;
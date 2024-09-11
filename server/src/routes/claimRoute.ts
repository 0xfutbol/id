import axios from 'axios';
import { Wallet, ethers } from 'ethers';
import express from 'express';
import { getMetaSoccerIdByOwner, getMetaSoccerIdByUsername, validateUsername } from '../common/utils';

const claimRouter = express.Router();

const LOW_BALANCE_THRESHOLD = ethers.parseEther("0.000001");

claimRouter.post('/claim', express.json(), async (req, res) => {
  const { username, owner } = req.body;

  if (!username || !owner) {
    return res.status(400).json({ error: 'Username and owner address are required' });
  }

  try {
    const existingUserByOwner = await getMetaSoccerIdByOwner(owner);
    if (existingUserByOwner.length > 0) {
      const existingUserByUsername = await getMetaSoccerIdByUsername(username);
      if (existingUserByUsername.length > 0 && existingUserByUsername[0].owner.toLowerCase() === owner.toLowerCase()) {
        const signatureData = await generateSignature(username, owner);
        return res.json({ ...signatureData, claimed: true });
      }
      return res.status(400).json({ error: 'This address has already claimed another username' });
    }

    const existingUserByUsername = await getMetaSoccerIdByUsername(username);
    if (existingUserByUsername.length > 0) {
      return res.status(400).json({ error: 'This username has already been claimed' });
    }

    const validationResult = await validateUsername(username);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    checkAndRequestGas(owner);

    const signatureData = await generateSignature(username, owner);
    res.json({ ...signatureData, claimed: false });
  } catch (error) {
    console.error('Error in claim route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function generateSignature(username: string, owner: string): Promise<{ signature: string, signatureExpiration: number }> {
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

    console.log('Debug - Private Key:', privateKey.slice(0, 6) + '...');
    console.log('Debug - Domain:', JSON.stringify(domain));
    console.log('Debug - Types:', JSON.stringify(types));
    console.log('Debug - Message:', JSON.stringify(message));

    const signature = await wallet.signTypedData(domain, types, message);

    console.log('Debug - Signature:', signature);

    return { signature, signatureExpiration };
  } catch (error) {
    console.error('Error creating claim signature:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw new Error('Internal server error');
  }
}

async function checkAndRequestGas(address: string) {
  const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
  const balance = await provider.getBalance(address);

  if (balance < LOW_BALANCE_THRESHOLD) {
    console.log(`Balance below threshold for address ${address}. Requesting gas from faucet.`);
    try {
      const response = await axios.put('https://sfuel-faucet-h8r2g.ondigitalocean.app/gas', { address }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Faucet response:', response.data);
    } catch (error) {
      console.error('Error requesting gas from faucet:', error);
      throw new Error('Failed to request gas from faucet');
    }
  }
}

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
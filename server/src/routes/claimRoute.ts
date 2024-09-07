import axios from 'axios';
import { Wallet, ethers } from 'ethers';
import express from 'express';
import { getMetaSoccerIdByOwner, validateUsername } from '../common/utils';

const claimRouter = express.Router();

const LOW_BALANCE_THRESHOLD = ethers.parseEther("0.000001");

claimRouter.post('/claim', express.json(), async (req, res) => {
  const { username, owner } = req.body;

  if (!username || !owner) {
    return res.status(400).json({ error: 'Username and owner address are required' });
  }

  // Check if the owner has already claimed a username
  const existingClaims = await getMetaSoccerIdByOwner(owner);
  if (existingClaims.length > 0) {
    return res.status(400).json({ error: 'This address has already claimed another username' });
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
    
    // Check owner's balance and request gas if needed
    await checkAndRequestGas(owner);

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

async function checkAndRequestGas(address: string) {
  console.log(`Checking gas balance for address: ${address}`);
  const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
  const balance = await provider.getBalance(address);
  console.log(`Current balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < LOW_BALANCE_THRESHOLD) {
    console.log(`Balance below threshold. Requesting gas from faucet.`);
    const requestGasFromFaucet = async () => {
      try {
        console.log(`Sending request to faucet...`);
        const response = await axios.put('https://sfuel-faucet-h8r2g.ondigitalocean.app/gas', { address }, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Faucet response:', response.data);
      } catch (error) {
        console.error('Error requesting gas from faucet:', error);
        throw new Error('Failed to request gas from faucet');
      }
    };

    await requestGasFromFaucet();
    console.log(`Gas request completed. New balance will be checked on next transaction.`);
  } else {
    console.log(`Balance is sufficient. No need to request gas.`);
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
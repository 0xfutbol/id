import axios from 'axios';
import { ethers } from 'ethers';
import express from 'express';
import { getAddress, saveAddress } from '../repo/db';

const pingRouter = express.Router();

const FAUCET_URL = 'https://sfuel-faucet-h8r2g.ondigitalocean.app/gas';
const LOW_BALANCE_THRESHOLD = ethers.parseEther("0.000001");

pingRouter.post('/ping', express.json(), async (req, res) => {
  const { address } = req.body;

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  try {
    const existingAddress = await getAddress(address);

    if (!existingAddress) {
      await checkAndRequestGas(address);
      await saveAddress(address);
    }

    res.json({ message: "Pong!" });
  } catch (error) {
    console.error('Error in ping route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function checkAndRequestGas(address: string) {
  const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
  const balance = await provider.getBalance(address);

  if (balance < LOW_BALANCE_THRESHOLD) {
    console.log(`Balance below threshold for address ${address}. Requesting gas from faucet.`);
    await requestGasFromFaucet(address);
  }
}

async function requestGasFromFaucet(address: string, retryCount = 1) {
  try {
    const response = await axios.put(FAUCET_URL, { address }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Faucet response:', response.data);
  } catch (error) {
    console.error(`Error requesting gas from faucet (attempt ${retryCount}):`, error);
    if (retryCount < 2) {
      console.log('Retrying gas request...');
      await requestGasFromFaucet(address, retryCount + 1);
    } else {
      throw new Error('Failed to request gas from faucet after retry');
    }
  }
}

export default pingRouter;
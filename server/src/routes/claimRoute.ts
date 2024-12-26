import express from 'express';
import { oxFutboId } from '../common/id';
import { getOxFutbolIdByOwner, getOxFutbolIdByUsername } from '../common/squid';
import { validateUsername } from '../common/utils';
import { registerUsername, wallet } from '../common/web3';

const claimRouter = express.Router();

claimRouter.post('/claim', express.json(), async (req, res) => {
  const { username, owner } = req.body;

  if (!username || !owner) {
    return res.status(400).json({ error: 'Username and owner address are required' });
  }

  try {
    const existingUserByOwner = await getOxFutbolIdByOwner(owner);
    if (existingUserByOwner) {
      const existingUserByUsername = await getOxFutbolIdByUsername(username);
      if (existingUserByUsername?.owner.toLowerCase() === owner.toLowerCase()) {
        const signatureData = await oxFutboId.generateSignature(username, owner);
        return res.json({ ...signatureData, claimed: true });
      }
      return res.status(400).json({ error: 'This address has already claimed another username' });
    }

    const existingUserByUsername = await getOxFutbolIdByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ error: 'This username has already been claimed' });
    }

    const validationResult = await validateUsername(username);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    const signatureData = await oxFutboId.generateSignature(username, owner);

    // We are enhancing the transparency of the username registration process by transitioning to a new 
    // smart contract (OxFutbolID) that allows the backend to register usernames onchain.
    // Since the new contract is not yet deployed, we continue to use the old contract (MetaSoccerID) 
    // and sign the request with the backend wallet address.
    // Therefore, we need to generate a new signature using the backend wallet address.
    console.debug("[0xFútbol ID] Generating signature for username:", username, wallet.address);
    const { signature, signatureExpiration } = await oxFutboId.generateSignature(username, wallet.address);
    console.debug("[0xFútbol ID] Registering username:", username);
    const tx = await registerUsername(username, signature, signatureExpiration);
    console.debug("[0xFútbol ID] Transaction completed:", tx);

    return res.json({ ...signatureData, claimed: true });
  } catch (error) {
    console.error('Error in claim route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default claimRouter;
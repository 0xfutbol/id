import express from 'express';
import { oxFutboId } from '../common/id';
import { registerUsername, wallet } from '../common/web3';
import { saveUserIfDoesntExists } from '../repo/db';

const claimRouter = express.Router();

claimRouter.post('/claim', express.json(), async (req, res) => {
  const { username, owner, message, loginMethod, expiration } = req.body;

  if (!isValidRequest(username, owner, message, expiration)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  if (!oxFutboId.isValidSignatureExpiration(expiration)) {
    return res.status(400).json({ error: 'Signature expired or too far in the future' });
  }

  try {
    await oxFutboId.validateSignature(message, owner, username, expiration);

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
    
    // Save the user in the database
    await saveUserIfDoesntExists(owner, username, loginMethod ?? "unknown");

    // Return the token in the JSON response as well
    res.json({ success: true });
  } catch (error) {
    console.error('Error in claimUsername route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function isValidRequest(username: string, owner: string, signature: string, expiration: number): boolean {
  return Boolean(username && owner && signature && expiration);
}

export default claimRouter;
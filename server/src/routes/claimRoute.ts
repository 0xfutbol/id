import express from 'express';
import { oxFutboId } from '../common/id';
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

    // Save the user in the database
    console.debug("[0xFútbol ID] Registering username:", username);
    await saveUserIfDoesntExists(owner, username, loginMethod ?? "unknown");
    console.debug("[0xFútbol ID] Username registered successfully");

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
import express from 'express';
import { oxFutboId } from '../common/id';
import { getUserByUsername, saveUserIfDoesntExists } from '../repo/db';

const jwtRouter = express.Router();

jwtRouter.post('/jwt', express.json(), async (req, res) => {
  const { username, message, loginMethod, expiration } = req.body;

  if (!isValidRequest(username, message, expiration)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  if (!oxFutboId.isValidSignatureExpiration(expiration)) {
    return res.status(400).json({ error: 'Signature expired or too far in the future' });
  }

  try {
    const oxFutbolId = await getUserByUsername(username);

    if (!oxFutbolId) {
      return res.status(404).json({ error: '0xFútbol ID not found' });
    }

    const owner = oxFutbolId.address;

    await oxFutboId.validateSignature(message, owner, username, expiration);

    const token = oxFutboId.createJWT(username, owner, message, expiration);
    
    // Save the user in the database
    await saveUserIfDoesntExists(owner, username, loginMethod ?? "unknown");

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

export default jwtRouter;
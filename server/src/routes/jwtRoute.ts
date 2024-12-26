import { MAX_SIGNATURE_EXPIRATION } from "@0xfutbol/id";
import express from 'express';
import { oxFutboId } from '../common/id';
import { getOxFutbolIdByUsername } from '../common/utils';
import { saveUserIfDoesntExists } from '../repo/db';

const jwtRouter = express.Router();

jwtRouter.post('/jwt', express.json(), async (req, res) => {
  const { username, loginMethod, message, expiration } = req.body;

  if (!isValidRequest(username, message, expiration)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  if (!oxFutboId.isValidSignatureExpiration(expiration)) {
    return res.status(400).json({ error: 'Signature expired or too far in the future' });
  }

  try {
    const oxFutbolIds = await getOxFutbolIdByUsername(username, 60);

    if (oxFutbolIds.length === 0) {
      return res.status(404).json({ error: '0xFútbol ID not found' });
    }

    const owner = oxFutbolIds[0].owner;

    await oxFutboId.validateSignature(message, owner, username, expiration);

    const token = oxFutboId.createJWT(username, owner, message, expiration);
    
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

export default jwtRouter;
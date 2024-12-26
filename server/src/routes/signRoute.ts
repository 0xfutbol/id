import express from 'express';
import { oxFutboId } from '../common/id';
import { getOxFutbolIdByOwner, getOxFutbolIdByUsername } from '../common/squid';
import { validateUsername } from '../common/utils';

const signRouter = express.Router();

signRouter.post('/sign', express.json(), async (req, res) => {
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

    return res.json({ ...signatureData, claimed: false });
  } catch (error) {
    console.error('Error in claim route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default signRouter;
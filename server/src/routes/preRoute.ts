import express from 'express';
import { getMetaSoccerIdByUsername, validateUsername } from '../common/utils';
import { getUser } from '../repo/db';

const preRouter = express.Router();

preRouter.post('/pre', express.json(), async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const validationResult = await validateUsername(username);
  if (!validationResult.isValid) {
    return res.status(400).json({ error: validationResult.error });
  }

  try {
    const trimmedUsername = username.trim();
    const metaSoccerIds = await getMetaSoccerIdByUsername(trimmedUsername);
    const claimed = metaSoccerIds.length > 0;

    if (claimed) {
      const user = await getUser(trimmedUsername);
      res.json({ claimed: true, loginMethod: user?.login_method });
    } else {
      res.json({ claimed: false });
    }
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default preRouter;
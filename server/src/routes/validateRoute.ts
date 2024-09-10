import express from 'express';
import { getMetaSoccerIdByUsername, validateUsername } from '../common/utils';

const validateRouter = express.Router();

validateRouter.post('/validate', express.json(), async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const trimmedUsername = username.trim();
    const validationResult = await validateUsername(trimmedUsername);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    const metaSoccerIds = await getMetaSoccerIdByUsername(trimmedUsername);
    const claimed = metaSoccerIds.length > 0;

    res.json({ claimed });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default validateRouter;
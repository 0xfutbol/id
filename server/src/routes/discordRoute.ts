import axios from 'axios';
import express from 'express';
import { authenticateJWT } from '../common/auth';
import { getDiscordAccountByDiscordId, saveDiscordAccount } from '../repo/db';

const discordRouter = express.Router();

const clientId = process.env.DISCORD_CLIENT_ID!;
const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
const botToken = process.env.DISCORD_BOT_TOKEN!;

discordRouter.post('/discord', express.json(), authenticateJWT, async (req: express.Request & { user?: { owner: string } }, res) => {
  const { code, redirectUri } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Auth code missing" });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const discordAuth = await authenticate(code, redirectUri);
    const { access_token } = discordAuth.data;
    const discordUser = await fetchUser(access_token);

    const discordAlreadyConnected = await getDiscordAccountByDiscordId(discordUser.data.id);

    if (!discordAlreadyConnected) {
      await saveDiscordAccount(discordUser.data.id, req.user.owner, discordUser.data);
      // await giveRole(discordUser.data.id);

      res.json({ message: "Discord account connected successfully", data: discordUser.data });
    } else {
      res.status(400).json({ message: "Discord account already connected" });
    }
  } catch (error: any) {
    console.log(error.message);
    console.error('Error connecting Discord');
    res.status(500).json({ message: "Error connecting Discord" });
  }
});

async function authenticate(code: string, redirectUri: string) {
  return await axios.post(
    "https://discord.com/api/oauth2/token",
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
}

async function fetchUser(accessToken: string) {
  return await axios.get("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

async function giveRole(userId: string) {
  const roleId = "1229234774254686350";
  const guildId = "953005818394050570";
  try {
    await axios.put(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {},
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

export default discordRouter;
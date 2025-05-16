import express from 'express';
import { oxFutboId } from './id';

// User authentication
export const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    oxFutboId.verifyJWT(token, (err: Error | null, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      // @ts-ignore
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Admin authentication
export const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.indexOf('Basic ') === -1) {
    return res.sendStatus(401);
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username !== '0xfutbol' || password !== '1234567890') {
    return res.sendStatus(401);
  }

  next();
};

import { NextFunction, Request, Response } from 'express';
import { oxFutboId } from '../utils/common/id';

// Extended Request type to include user information
export interface AuthRequest extends Request {
  user?: {
    username: string;
    owner: string;
  };
}

/**
 * Middleware to verify if user is authenticated via JWT
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    oxFutboId.verifyJWT(token, (err: Error, user: any) => {
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

/**
 * Middleware to authenticate and verify admin role in one step
 */
export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
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
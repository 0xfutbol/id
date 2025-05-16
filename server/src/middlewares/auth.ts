import { NextFunction, Request, Response } from 'express';
import authService from '../services/authService';

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
    const user = authService.verifyToken(token);
    
    if (!user) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  } else {
    res.sendStatus(401);
  }
};

/**
 * Middleware to verify if user has admin role
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (authService.isAdmin(req.user.owner)) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

/**
 * Middleware to authenticate and verify admin role in one step
 */
export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticateJWT(req, res, () => {
    isAdmin(req, res, next);
  });
}; 
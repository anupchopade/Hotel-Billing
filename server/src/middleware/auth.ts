import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export interface AuthUser {
  id: string;
  role: 'admin' | 'cashier';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
    
    // Check if user still exists and is not deleted
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, isDeleted: true }
    });
    
    if (!user || user.isDeleted) {
      return res.status(401).json({ error: 'User account has been deactivated' });
    }
    
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}



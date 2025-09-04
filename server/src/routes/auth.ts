import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addDays } from 'date-fns';
import speakeasy from 'speakeasy';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // Allow both admin and cashier to login
  if (user.role !== 'admin' && user.role !== 'cashier') return res.status(403).json({ error: 'Invalid user role' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // Optional TOTP 2FA if enabled
  if (user.twoFactorEnabled) {
    const { code } = req.body as any;
    if (!code || !user.twoFactorSecret) return res.status(401).json({ error: '2FA code required' });
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  const accessToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
  const refreshTokenRaw = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  await prisma.refreshToken.create({ data: { token: refreshTokenRaw, userId: user.id, expiresAt: addDays(new Date(), 7) } });

  res.json({ accessToken, refreshToken: refreshTokenRaw, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/refresh', async (req, res) => {
  const token = (req.body?.refreshToken as string) || '';
  if (!token) return res.status(400).json({ error: 'Missing refresh token' });
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Invalid refresh token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    const accessToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    // Rotate refresh token
    const refreshTokenRaw = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    await prisma.refreshToken.update({ where: { token }, data: { token: refreshTokenRaw, expiresAt: addDays(new Date(), 7) } });
    res.json({ accessToken, refreshToken: refreshTokenRaw });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;



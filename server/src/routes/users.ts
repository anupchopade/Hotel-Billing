import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'cashier']),
  password: z.string().min(6)
});

router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { name, email, role, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email: email.toLowerCase(), role, passwordHash } });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'cashier']).optional()
});

router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const data = parsed.data;
  if (data.email) data.email = data.email.toLowerCase();
  try {
    const user = await prisma.user.update({ where: { id }, data });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

router.patch('/:id/password', async (req, res) => {
  const id = req.params.id;
  const body = z.object({ password: z.string().min(6) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid payload' });
  const passwordHash = await bcrypt.hash(body.data.password, 10);
  try {
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;



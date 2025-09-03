import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await prisma.menuItem.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});

const upsertSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  fullPrice: z.number().nonnegative(),
  halfPrice: z.number().nonnegative(),
  isAvailable: z.boolean().default(true)
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const data = parsed.data;
  const created = await prisma.menuItem.create({ data });
  res.status(201).json(created);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  try {
    const updated = await prisma.menuItem.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

export default router;



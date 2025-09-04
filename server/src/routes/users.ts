import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ 
    where: { isDeleted: false },
    select: { id: true, name: true, email: true, role: true, createdAt: true, isDeleted: true } 
  });
  res.json(users);
});

// Get deleted users for admin management
router.get('/deleted', async (_req, res) => {
  const deletedUsers = await prisma.user.findMany({ 
    where: { isDeleted: true },
    select: { id: true, name: true, email: true, role: true, createdAt: true, isDeleted: true } 
  });
  res.json(deletedUsers);
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
  if (existing && !existing.isDeleted) return res.status(409).json({ error: 'Email already exists' });
  if (existing && existing.isDeleted) return res.status(409).json({ error: 'Email belongs to a deleted user. Please reactivate the existing account instead.' });
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
    // First, check if the user exists
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already deleted
    if (userToDelete.isDeleted) {
      return res.status(400).json({ error: 'User already deleted' });
    }

    // Note: No special restrictions needed for soft delete

    // Soft delete: just set isDeleted = true
    await prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    });

    // Delete all refresh tokens for this user to prevent login
    await prisma.refreshToken.deleteMany({
      where: { userId: id }
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Reactivate a deleted user
router.patch('/:id/reactivate', async (req, res) => {
  const id = req.params.id;
  
  try {
    // First, check if the user exists
    const userToReactivate = await prisma.user.findUnique({ where: { id } });
    if (!userToReactivate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already active
    if (!userToReactivate.isDeleted) {
      return res.status(400).json({ error: 'User is already active' });
    }

    // Reactivate: set isDeleted = false
    const reactivatedUser = await prisma.user.update({
      where: { id },
      data: { isDeleted: false }
    });

    res.json({ 
      id: reactivatedUser.id, 
      name: reactivatedUser.name, 
      email: reactivatedUser.email, 
      role: reactivatedUser.role 
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

export default router;



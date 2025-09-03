import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { from, to, createdBy } = req.query as Record<string, string | undefined>;
  const where: any = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }
  if (createdBy) where.createdById = createdBy;
  const bills = await prisma.bill.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  res.json(bills);
});

router.get('/:id', requireAuth, async (req, res) => {
  const bill = await prisma.bill.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  res.json(bill);
});

const itemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  type: z.enum(['full', 'half']),
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
  total: z.number().nonnegative()
});
const createSchema = z.object({
  customer: z.string().min(1),
  tableNumber: z.string().min(1),
  items: z.array(itemSchema).min(1),
  discount: z.number().nonnegative().default(0)
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const data = parsed.data;

  const subtotal = data.items.reduce((s, it) => s + it.total, 0);
  const cgst = +(subtotal * 0.09).toFixed(2);
  const sgst = +(subtotal * 0.09).toFixed(2);
  const total = +(subtotal + cgst + sgst - data.discount).toFixed(2);

  // Generate bill number: BYYMM-XXX
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `B${yy}${mm}`;
  const last = await prisma.bill.findFirst({
    where: { billNo: { startsWith: prefix } },
    orderBy: { billNo: 'desc' },
    select: { billNo: true }
  });
  const nextSeq = last ? (parseInt(last.billNo.slice(5)) + 1) : 1;
  const billNo = `${prefix}${nextSeq.toString().padStart(3, '0')}`;

  const created = await prisma.bill.create({
    data: {
      billNo,
      customer: data.customer,
      tableNumber: data.tableNumber,
      subtotal,
      cgst,
      sgst,
      discount: data.discount,
      total,
      createdById: req.user!.id,
      items: {
        create: data.items.map(it => ({
          menuItemId: it.menuItemId,
          nameSnapshot: it.name,
          type: it.type as any,
          qty: it.qty,
          price: it.price,
          total: it.total
        }))
      }
    },
    include: { items: true }
  });

  res.status(201).json(created);
});

export default router;



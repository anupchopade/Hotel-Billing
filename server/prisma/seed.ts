import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hotel.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({ data: { name: 'Admin', email: adminEmail, role: 'admin', passwordHash } });
    console.log('Seeded admin user:', adminEmail);
  } else {
    console.log('Admin already exists:', adminEmail);
  }
}

main().then(() => prisma.$disconnect());



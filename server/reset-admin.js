const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@hotel.com' },
      update: {
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      },
      create: {
        email: 'admin@hotel.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    });

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email: admin@hotel.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

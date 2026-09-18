require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword },
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      phone: '+91 90000 00000',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Seeded admin: admin@example.com / password');

  const doctors = [
    { name: 'Dr. John Smith', email: 'john@example.com', phone: '+91 98765 43210', specialization: 'Cardiologist' },
    { name: 'Dr. Sarah Wilson', email: 'sarah@example.com', phone: '+91 98765 43211', specialization: 'Dermatologist' },
    {
      name: 'Dr. Michael Brown',
      email: 'michael@example.com',
      phone: '+91 98765 43212',
      specialization: 'General Physician',
    },
  ];

  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { email: doctor.email },
      update: {},
      create: { ...doctor, status: 'ACTIVE' },
    });
  }
  console.log(`Seeded ${doctors.length} sample doctors.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

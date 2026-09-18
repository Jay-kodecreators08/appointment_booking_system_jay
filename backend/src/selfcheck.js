// Minimal smoke test: verifies the Express app and all routes/services load
// without throwing, and that the Prisma client can reach the database.
require('dotenv').config();
const prisma = require('./config/prisma');

async function run() {
  require('./app'); // throws on any wiring error
  await prisma.$queryRaw`SELECT 1`;
  console.log('Self-check passed: app loads and database is reachable.');
  await prisma.$disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Self-check failed:', err);
  process.exit(1);
});

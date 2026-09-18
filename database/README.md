# Database

This project uses **PostgreSQL** with **Prisma ORM**. Schema and migrations live in
`backend/prisma/` (not here), since Prisma keeps migrations next to the backend that owns them.

- Schema: `backend/prisma/schema.prisma`
- Migrations: `backend/prisma/migrations/`
- Seed script: `backend/prisma/seed.js`

Database name: `appointment_booking_db`

See the root `README.md` for full setup instructions.

# Appointment Booking System

A full-stack appointment booking system with separate **Admin** and **Patient** portals.

## Tech Stack

**Frontend:** React 19 + Vite, React Router, Axios, plain CSS (no UI framework)
**Backend:** Node.js + Express.js, JWT auth, bcrypt, express-validator
**Database:** PostgreSQL + Prisma ORM

## Project Structure

```
Test-Today/
├── frontend/     React + Vite SPA (Admin portal + Patient portal)
├── backend/      Express REST API + Prisma schema/migrations/seed
├── database/     Notes only — schema/migrations live in backend/prisma
├── README.md
└── .gitignore
```

Frontend and backend are fully separated and communicate only over the REST API.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL (running locally)

## PostgreSQL Setup

Create the database (default local Postgres user, no password, matching this machine's setup):

```bash
psql -U <your-username> -d postgres -c "CREATE DATABASE appointment_booking_db;"
```

Then set `DATABASE_URL` in `backend/.env` to match your Postgres user/password.

> **macOS note:** port `5000` is commonly occupied by the macOS AirPlay Receiver /
> ControlCenter. This project's backend defaults to port **5001** for that reason.
> If you don't have that conflict, feel free to change `PORT` in `backend/.env`.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit DATABASE_URL / JWT_SECRET as needed

npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Backend runs at **http://localhost:5001**.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # points to the backend API by default
npm run dev
```

Frontend runs at **http://localhost:5173**.

## Default Admin Account

```
Email:    admin@example.com
Password: Admin@123
```

Created automatically by `npm run seed`, along with 3 sample doctors
(Dr. John Smith – Cardiologist, Dr. Sarah Wilson – Dermatologist,
Dr. Michael Brown – General Physician). No sample appointments are seeded.

## Application URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api
- Health check: http://localhost:5001/health

## Key Assumptions

The test brief left a few details unspecified. Reasonable assumptions made, all
enforced server-side:

1. **Slot duration = 30 minutes.** Not specified in the brief, so availability
   windows are sliced into fixed 30-minute bookable slots (e.g. 09:00–17:00 →
   09:00-09:30, 09:30-10:00, ...).
2. ~~One availability period per doctor per day.~~ **Superseded** — see
   [Change Request](#change-request-multiple-availability-periods--doctor-breaks)
   below. A doctor can now have multiple non-overlapping periods per day.
3. **Double-booking prevention** is enforced at both the application layer
   (pre-checks + a DB transaction) and the database layer, via a **partial
   unique index** on `appointments(doctorId, appointmentDate, startTime)
   WHERE status = 'BOOKED'`. This blocks two active bookings for the same
   slot while still allowing a cancelled+rebooked history for that slot.
4. **Soft delete for doctors.** "Delete" deactivates a doctor (`status =
   INACTIVE`) rather than removing the row, since a doctor may already have
   appointment/availability history.
5. **Cancelled appointments are kept**, not deleted, so patients and admins
   retain appointment history; a cancelled slot immediately becomes bookable
   again.
6. **Dates/times use plain strings** (`YYYY-MM-DD`, `HH:mm`) end-to-end and
   are parsed as UTC-midnight on the backend, avoiding local-timezone date
   shifting bugs.
7. **Past slots aren't bookable.** For today's date, slots whose start time
   has already passed are shown as disabled, not just past dates entirely.
8. **JS, not TypeScript**, for the frontend — kept simple for a timed test.

## Change Request: Multiple Availability Periods + Doctor Breaks

A follow-up change request replaced the "one availability period per doctor
per day" rule. Summary of what changed and why:

1. **Multiple availability periods.** `DoctorAvailability` no longer has a
   `(doctorId, date)` unique constraint — a doctor can have several periods
   per day (e.g. `09:00-13:00` and `14:00-17:00`). The backend rejects
   **overlapping** periods for the same doctor/date; **touching** periods
   (`09:00-13:00` + `13:00-14:00`) are allowed. Slots are generated
   independently per period, so the gap between periods never produces a
   bookable slot.
2. **Doctor breaks.** A new `DoctorBreak` model blocks appointment slots
   within a time window, without being stored as an appointment. A break
   must fall **entirely inside one availability period** — this is the
   simpler, safer rule chosen over splitting a break across a gap (see
   `break.service.js` `validateBreakWindow`). Breaks cannot overlap each
   other. Booking (and slot generation) checks breaks the same way it
   checks existing appointments, and rejects direct API booking attempts
   inside a break with `409` — frontend disabling is not relied on.
3. **Automatic rescheduling.** Creating (or editing) a break that overlaps
   existing `BOOKED` appointments automatically moves each affected
   appointment to the **nearest free slot** for the same doctor/date
   (never a different doctor or date). "Nearest" is measured in minutes
   from the original start time; on a tie, the **later** slot wins
   (documented, deterministic). Multiple affected appointments are
   processed in start-time order, each claiming its new slot before the
   next is considered, so two patients can never be assigned the same
   replacement slot.
4. **Transaction safety.** Break creation/update, the affected-appointment
   lookup, and every reschedule happen inside one Prisma `$transaction`.
   If **any** affected appointment has no valid replacement slot, the
   whole transaction throws and rolls back — the break is not created and
   no appointment is moved, and the admin sees "Break cannot be added
   because one or more existing appointments cannot be rescheduled."
   Appointments are never silently cancelled or dropped.
5. **Slot duration** stays 30 minutes, per the original assumption.

Verified end-to-end (API + browser): overlapping/touching availability
periods, break-outside-availability rejection, break-overlap rejection,
direct-API booking inside a break, single and multi-appointment
reschedules with distinct destination slots, and the no-free-slot rollback
case (appointments and breaks left completely untouched).

## Test Flow

1. **Admin** logs in at `/admin/login` → adds a doctor → sets that doctor's
   availability for a date (start/end time).
2. **Patient** registers at `/register`, logs in, browses doctors at
   `/patient/doctors`, opens a doctor, picks the date the admin configured,
   and sees the generated 30-minute slot grid.
3. Patient **books** an open slot → confirmation dialog → booking succeeds →
   redirected to **My Appointments** (Upcoming tab).
4. A second patient attempting the *same* doctor/date/slot gets
   `409 – "This appointment slot is no longer available."`
5. Patient **cancels** the appointment → it moves to the Cancelled tab → the
   slot is immediately bookable again by anyone.
6. **Admin** can see all appointments at `/admin/appointments`, filterable by
   doctor / date / status, with patient search.

All of the above was verified end-to-end against a running Postgres instance,
via direct API calls (double-booking race, RBAC, validation edge cases) and
via a full browser-driven pass (Playwright) covering admin login → doctor →
availability → patient register → browse → book → cancel, with zero console
errors.

## API Overview

See `backend/postman/appointment-booking.postman_collection.json` for a full
importable collection. Routes:

- `POST /api/auth/register` · `/login` · `/admin-login` · `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/admin/doctors[/:id]`
- `GET/POST/PUT/DELETE /api/admin/availability[/:id]` (multiple periods per doctor/date allowed)
- `GET/POST/PUT/DELETE /api/admin/breaks[/:id]` (create/update auto-reschedules affected appointments)
- `GET /api/admin/appointments` (filters: `doctorId`, `date`, `status`)
- `GET /api/admin/dashboard`
- `GET /api/doctors` · `/:id` · `/:id/availability?date=` · `/:id/slots?date=`
- `POST /api/appointments` · `GET /api/appointments/my` · `/:id` ·
  `PATCH /api/appointments/:id/cancel`

## Commands Reference

```bash
# Backend
cd backend
npm run dev      # start API with nodemon
npm start        # start API with plain node
npm run seed     # (re)seed admin + sample doctors
npm test         # smoke test: app wiring + DB connectivity

# Frontend
cd frontend
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview the production build
```

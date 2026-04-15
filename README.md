# Cinema API (NestJS + Prisma + PostgreSQL + Docker)

RESTful Cinema API with NestJS, Prisma and business rules.
Includes User, Profile and Address modules (Exam N1 - CMP2305).

## Global Docker (frontend + backend + database)

From the project root (`projeto-fullstack`), run:

```bash
docker compose build
docker compose up
```

Services started together:

- Frontend (Vite): `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- PostgreSQL: `localhost:5433`

To stop and remove volumes:

```bash
docker compose down -v
```

## How to run (Docker)

```bash
docker compose build
docker compose up
```

This starts PostgreSQL and the API automatically. Migrations run on startup.

Swagger docs: `http://localhost:3000/api`

## Authentication (JWT)

The API now includes authentication with JWT.

- `POST /auth/register`: public route to register a new user in the `USER` group.
- `POST /auth/login`: public route to authenticate and receive `accessToken`.
- `GET /auth/me`: protected route (`Authorization: Bearer <token>`) to get the authenticated user.

Default groups are created automatically when the app starts: `ADMIN` and `USER`.

Default admin user is also created automatically (if it does not exist):

- Email: `admin@gmail.com`
- Password: `admin`

## Reset everything (clean database and volumes)

```bash
docker compose down -v
docker compose up
```

---

## Resource creation flow

The API has dependencies between entities. Follow the order below to register everything correctly.

### Phase 1 - Independent entities (no dependencies)

Create these first, in any order:

**1. Create Profile**
```bash
curl -X POST http://localhost:3000/profiles \
  -H 'Content-Type: application/json' \
  -d '{"name": "ADMIN"}'
```
> Note the `id` (UUID) returned. You will need it to create a User.

**2. Create Genre**
```bash
curl -X POST http://localhost:3000/genres \
  -H 'Content-Type: application/json' \
  -d '{"name": "Action"}'
```
> Note the `id` returned. You will need it to create a Movie.

**3. Create Room**
```bash
curl -X POST http://localhost:3000/rooms \
  -H 'Content-Type: application/json' \
  -d '{"identifier": "Room 1", "capacity": 100}'
```
> Note the `id` returned. You will need it to create a Session.

**4. Create Snack Combo (optional)**
```bash
curl -X POST http://localhost:3000/snack-combos \
  -H 'Content-Type: application/json' \
  -d '{"name": "Popcorn + Soda Combo", "description": "Large popcorn + 500ml soda", "price": 29.90}'
```
> Note the `id` if you want to include combos in Orders.

---

### Phase 2 - Entities that depend on Phase 1

**5. Create Movie** (depends on: Genre)
```bash
curl -X POST http://localhost:3000/movies \
  -H 'Content-Type: application/json' \
  -d '{"title": "Matrix", "genreId": 1, "duration": 136, "ageRating": "14"}'
```
> Use the Genre `id` created in Phase 1.

**6. Create User** (depends on: Profile)
```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"email": "mateus@example.com", "password": "password123", "name": "Mateus Gomes", "profileId": "<PROFILE_UUID>"}'
```
> Replace `<PROFILE_UUID>` with the Profile `id` from Phase 1.

---

### Phase 3 - Entities that depend on Phase 2

**7. Create Session** (depends on: Movie + Room)
```bash
curl -X POST http://localhost:3000/sessions \
  -H 'Content-Type: application/json' \
  -d '{"movieId": 1, "roomId": 1, "dateTime": "2026-04-01T19:00:00.000Z", "ticketPrice": 25.00}'
```
> Use the Movie and Room `id`s. The API validates schedule conflicts in the same room.

**8. Create Address** (depends on: User) - optional, 1 per user
```bash
curl -X POST http://localhost:3000/addresses \
  -H 'Content-Type: application/json' \
  -d '{"street": "Flower Street", "number": 123, "city": "Sao Paulo", "state": "SP", "zipCode": "01001-000", "userId": "<USER_UUID>"}'
```
> Replace `<USER_UUID>` with the User `id`. Each user can have at most 1 address.

---

### Phase 4 - Entities that depend on Phase 3

**9. Buy Ticket** (depends on: Session)
```bash
curl -X POST http://localhost:3000/tickets \
  -H 'Content-Type: application/json' \
  -d '{"sessionId": 1, "type": "FULL"}'
```
> Types: `FULL` or `HALF`. The value is calculated automatically. The API checks room capacity.

**10. Create Order with items** (depends on: Ticket and/or SnackCombo)
```bash
curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {"type": "TICKET", "referenceId": 1},
      {"type": "COMBO", "referenceId": 1}
    ]
  }'
```
> `referenceId` points to a Ticket `id` (if type = TICKET) or SnackCombo `id` (if type = COMBO).

---

## Dependency diagram

```
Profile ──→ User ──→ Address
Genre   ──→ Movie ──┐
Room  ──────────────┼──→ Session ──→ Ticket ──┐
SnackCombo ───────────────────────────────────┼──→ Order (with items)
```

## Endpoints

### Cinema

| Resource | Route | Methods |
|----------|-------|---------|
| Genres | `/genres` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Movies | `/movies` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Rooms | `/rooms` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Sessions | `/sessions` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Tickets | `/tickets` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Snack Combos | `/snack-combos` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Orders | `/orders` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |

### Users (Exam N1)

| Resource | Route | Methods |
|----------|-------|---------|
| Profiles | `/profiles` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Users | `/users` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Addresses | `/addresses` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |

### Authentication

| Resource | Route | Methods |
|----------|-------|---------|
| Auth | `/auth` | POST `/register`, POST `/login`, GET `/me` |

## Relationships

- Profile 1:N User
- User 1:1 Address (cascade delete)
- Genre 1:N Movie
- Movie 1:N Session
- Room 1:N Session
- Session 1:N Ticket
- Order 1:N OrderItem (cascade delete)

## Local development (without Docker)

```bash
npm install
```

Create `.env`:
```env
DATABASE_URL="postgresql://prisma:prisma@localhost:5433/cinema"
PORT=3000
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN="1d"
```

```bash
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

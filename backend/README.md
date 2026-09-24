# Sanatan Path — Admin Backend

Node.js + Express + MongoDB (Mongoose) API powering the Sanatan Path admin panel.
Plain JavaScript — no TypeScript, matching the frontend.

## Getting started

```
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run seed               # creates an admin, 3 teachers, 3 students, sample
                            # courses, free classes, puja packages/bookings,
                            # payments, and donations
npm run dev                 # starts the API on http://localhost:5000
```

After seeding, log in as:

| Role    | Email                        | Password      |
|---------|------------------------------|---------------|
| Admin   | admin@sanatanpath.com        | Admin@123     |
| Teacher | r.sharma@sanatanpath.com     | Teacher@123   |
| Student | ritika@example.com           | Student@123   |

`POST /api/auth/login` returns a JWT — send it as `Authorization: Bearer <token>`
on every `/api/admin/*` request (all of them require the `admin` role).

## Project layout

```
server.js                 entry point — connects to MongoDB, starts Express
src/
  app.js                  Express app: middleware + route mounting
  config/db.js            Mongoose connection
  models/                 one file per collection (User, Course, Enrollment,
                           Certificate, FreeClass, FreeClassParticipant,
                           Donation, SpecificPujaPackage,
                           SpecificPujaBooking, Payment)
  middleware/
    auth.js               protect (JWT check) + authorize(...roles)
    errorHandler.js        centralized error formatting + 404 handler
  controllers/             one file per resource, all using asyncHandler
                           so thrown errors reach errorHandler automatically
  routes/                  one file per resource, mounted in app.js
  utils/
    generateToken.js       signs the login JWT
    makeRoomId.js           generates a placeholder LiveKit room id
seed/seed.js               wipes and re-seeds sample data
```

## API reference

All `/api/admin/*` routes require `Authorization: Bearer <admin JWT>`.

### Auth
| Method | Route              | Notes                              |
|--------|---------------------|-------------------------------------|
| POST   | /api/auth/register  | Public — always creates a student  |
| POST   | /api/auth/login     | Any role                            |
| GET    | /api/auth/me         | Requires any valid token            |

### Users
| Method | Route                          |
|--------|----------------------------------|
| GET    | /api/admin/users?role=&search=  |
| GET    | /api/admin/users/teachers        |
| GET    | /api/admin/users/:id             |
| POST   | /api/admin/users                 (admin directly creates a teacher/admin/student) |
| PATCH  | /api/admin/users/:id             |
| DELETE | /api/admin/users/:id             |

### Courses (subscription-based)
| Method | Route                                |
|--------|----------------------------------------|
| GET    | /api/admin/courses                    |
| POST   | /api/admin/courses                    |
| GET    | /api/admin/courses/:id                 |
| PATCH  | /api/admin/courses/:id                 |
| DELETE | /api/admin/courses/:id                 |
| GET    | /api/admin/courses/:id/enrollments     |
| PATCH  | /api/admin/enrollments/:id/complete    (marks complete + issues a certificate) |

### Free Classes
| Method | Route                                       |
|--------|-----------------------------------------------|
| GET    | /api/admin/free-classes                       |
| POST   | /api/admin/free-classes                       |
| GET    | /api/admin/free-classes/:id                    |
| PATCH  | /api/admin/free-classes/:id                    |
| DELETE | /api/admin/free-classes/:id                    |
| GET    | /api/admin/free-classes/:id/participants       |
| GET    | /api/admin/free-classes/:id/donations          |

### Specific Puja
| Method | Route                                          |
|--------|---------------------------------------------------|
| GET    | /api/admin/specific-puja/packages                 |
| POST   | /api/admin/specific-puja/packages                 |
| PATCH  | /api/admin/specific-puja/packages/:id              |
| DELETE | /api/admin/specific-puja/packages/:id              |
| GET    | /api/admin/specific-puja/bookings                  |
| PATCH  | /api/admin/specific-puja/bookings/:id              (confirming auto-generates the private LiveKit room id) |

### Payments & Donations
| Method | Route                             |
|--------|--------------------------------------|
| GET    | /api/admin/payments                 |
| GET    | /api/admin/payments/summary          (this month's course/puja revenue + donations) |
| GET    | /api/admin/payments/donations        |

### Dashboard
| Method | Route                                        |
|--------|--------------------------------------------------|
| GET    | /api/admin/dashboard/stats                       |
| GET    | /api/admin/dashboard/recent-enrollments           |
| GET    | /api/admin/dashboard/upcoming-sessions            |

## What's deliberately left as a next step

- **Payment gateway integration (PayPal / PhonePe):** the `Payment` and
  `Donation` models and admin-read endpoints are in place, but nothing here
  calls PayPal's or PhonePe's actual APIs yet — that needs their SDKs and
  your merchant credentials, plus a webhook endpoint to mark a `Payment`/
  `Donation` as `success` once the gateway confirms it.
- **LiveKit room/token generation:** every course, free class, and puja
  booking gets a placeholder `liveKitRoomId` string when it's created. Real
  room creation and per-user access tokens need the `livekit-server-sdk`
  package plus your LiveKit API key/secret — straightforward to add on top
  of the existing `liveKitRoomId` fields.
- **PDF certificate generation:** completing an enrollment creates a
  `Certificate` record with a certificate number, but `pdfUrl` is left
  `null` — actually rendering a PDF (e.g. with `pdf-lib` or `puppeteer`)
  and storing/serving it is the next piece.
- **Teacher- and student-facing routes:** everything here is admin-only,
  matching the admin panel built so far. Teacher (join class, mark
  attendance) and student (browse/enroll/join) routes are a separate pass.
- **Language/localization:** intentionally out of scope for now, as discussed.

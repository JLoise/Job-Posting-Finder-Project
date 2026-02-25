# LoyseConnect

A job posting and finder website built with the **MERN stack** (MongoDB, Express, React, Node.js). Users can create an account, sign in, search for jobs with flexible matching (e.g. "dev" finds "Developer", "developer", "Dev"), and filter by location the same way. Authenticated users can post and manage their own job listings.

## Features

- **User accounts**: Register and sign in (JWT-based auth), or **Sign in with Google** (Gmail).
- **Flexible search**: Type "dev" to see jobs with "Dev", "Developer", "developer", etc. Same partial, case-insensitive matching for locations (e.g. "ny" → "New York, NY").
- **Filters**: Job type (Full-time, Part-time, Contract, etc.), location, and sort by most recent or salary.
- **Post a job**: Signed-in users can create and edit their listings; optional salary range and description.
- **My Jobs**: View and manage jobs you’ve posted.

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:3000` and proxies `/api` to the backend.

### 3. Environment (server)

Create `server/.env` with:

- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/loyseconnect` (or your Atlas URI)
- `JWT_SECRET=<a-long-random-secret>`
- **Optional (Google sign-in):** `GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com` — get it from [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials). Create an OAuth 2.0 Client ID (Web application), add `http://localhost:3000` to authorized JavaScript origins.

### 4. Environment (client, optional)

To show “Sign in with Google”:

- Create `client/.env` and set `VITE_GOOGLE_CLIENT_ID=<same-google-client-id-as-server>`.
- Restart the client (`npm run dev`).

### 5. Sample jobs (MongoDB)

From the **server** folder, run:

```bash
cd server
npm run seed
```

This creates a seed user (`seed@loyseconnect.example.com` / `seedpassword123`) and inserts **5 sample job postings** into MongoDB. If 5 jobs from that user already exist, the script exits without adding more.

## Scripts

| Location  | Command       | Description              |
|----------|---------------|--------------------------|
| `server/`| `npm run dev` | Start API with watch     |
| `server/`| `npm start`   | Start API                |
| `server/`| `npm run seed`| Insert 5 sample jobs     |
| `client/`| `npm run dev` | Start React dev server   |
| `client/`| `npm run build` | Production build       |

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **Frontend**: React 18, React Router, Vite
- **Search**: MongoDB regex (case-insensitive) on title, company, description, and location

# Helpdesk Frontend (React)

React frontend for the multi-tenant helpdesk platform.

## Live URL

- Frontend: https://yourapp.vercel.app

## Test Accounts

| Role     | Email                   | Password    |
|----------|-------------------------|-------------|
| Admin    | admin@test.com          | password123 |
| Agent    | agent.acme@test.com     | password123 |
| Customer | customer@test.com       | password123 |

---

## Tech Stack

- React 19 + Vite + TypeScript
- Zustand (auth state + persistence)
- Axios (API client + interceptors)
- React Router v6
- Ant Design + Custom CSS

---

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

Production: in **Vercel → Settings → Environment Variables**, set:

`VITE_API_URL` = `https://YOUR-SERVICE.onrender.com/api`

Then **Redeploy** (required — Vite bakes this in at build time).

Do **not** commit `.env` with `localhost` — it will break production builds.

---

## Local Setup

```bash
npm install
cp .env.example .env   # fill in VITE_API_URL
npm run dev
# runs on http://localhost:5173
```

---

## Pages

| Route | Roles | Description |
|-------|-------|-------------|
| /login | Public | Login page |
| /register | Public | Register as customer |
| /dashboard | All | Stats + recent tickets |
| /tickets | All | Paginated table + filters |
| /tickets/:id | All | Detail, status, comments |
| /tickets/create | Customer, Admin | New ticket form |
| /admin/users | Admin | User management |

---

## Auth Flow

1. User logs in → JWT token + user stored in Zustand
2. Token persisted in localStorage via Zustand persist
3. Axios interceptor attaches token to every request
4. 401 response → auto logout + redirect to /login
5. ProtectedRoute checks token + role before rendering

---

## Production Deploy (Vercel)

1. Import repo on Vercel
2. Set root directory to `asses-frontend`
3. Add environment variable `VITE_API_URL`
4. Deploy

See [DEPLOY.md](../DEPLOY.md) for full Railway + Vercel steps.

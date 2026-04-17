# Daily Life Dashboard

Tag-based personal control panel. See `docs/superpowers/specs/` for design and `docs/superpowers/plans/` for the MVP implementation plan.

## Quick start (dev)

Make sure MongoDB is running locally (`brew services start mongodb-community`), then:

```bash
npm run dev:backend      # backend on :4000
npm run dev:frontend     # frontend on :3000 (in another terminal)
```

Environment:
- Backend: `dldb-backend/.env` (copy from `.env.example`)
- Frontend: `dldb-frontend/.env.local` (copy from `.env.local.example`)

# Sprint Management Frontend

React + TypeScript application for the Sprint Management platform.

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend API services (or API gateway) that expose these endpoints:
  - `GET/POST /api/v1/projects`
  - `GET/POST /api/v1/sprints`
  - `GET/POST /api/v1/users`

## Configuration

Set the API base URL with `VITE_API_BASE_URL`.

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

If not set, the app defaults to `http://localhost:8080/api/v1`.

## Install and run

```bash
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173` by default.

## Build and preview

```bash
npm run build
npm run preview
```

## Notes

- The UI is organized by feature pages: Projects, Sprints, and Users.
- Each page includes a basic creation form and list/table view.
- API calls use typed service modules in `src/api` and display loading/error states.

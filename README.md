# Task Master

A full-stack task and project manager: React (Ant Design) on the frontend, Node/Express + MySQL on the backend, with JWT-based API key authentication, subtasks/checklists, and 11-language i18n support.

## Features

- **Tasks** - create, edit, complete, and delete tasks with priority and due dates.
- **Projects** - group work into projects with a subtask checklist and completion tracking.
- **Auth** - email/password registration and login, passwords hashed with bcrypt, short-lived signed API keys (JWT).
- **Internationalization** - English, Spanish, French, German, Italian, Polish, Russian, Chinese, Hindi, Arabic, Kikongo.
- **Accessible, responsive UI** built with Ant Design.

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, React Router, Ant Design, i18next |
| Backend    | Node.js, Express, JWT, bcrypt |
| Database   | MySQL / MariaDB |
| Infra      | Docker, Docker Compose, nginx |

## Project structure

```
.
├── backend/          Express API (routers, auth middleware, MySQL access)
├── frontend/          React SPA
├── docker-compose.yml
└── .env.example       Variables consumed by docker-compose
```

## Quick start (Docker)

This is the fastest way to run the whole stack (database included). There are two compose files: one for local development with hot reload, one for production.

```bash
git clone <this-repo>
cd Task-Manager
cp .env.example .env   # edit JWT_SECRET / DB_PASSWORD before any real use
```

### Local development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3000 (CRA dev server, live reload on save)
- Backend: http://localhost:4000 (nodemon, restarts on save)
- MariaDB is also reachable on `localhost:3306` for a DB GUI.
- Source is bind-mounted from `./backend` and `./frontend`, so edits on your machine apply immediately - no rebuild needed. Only rebuild (`--build`) after changing `package.json`.

### Production

```bash
docker compose up -d --build
```

Or, once CI has published images (see `docker-publish` workflow below), skip building locally:

```bash
docker compose pull
docker compose up -d
```

- Frontend: http://localhost:3000 (static build served by nginx)
- Backend API: http://localhost:4000 (health check at `/health`)
- MariaDB is initialized automatically from `backend/myDatabase.sql` on first boot.

Stop either stack with `docker compose [-f docker-compose.dev.yml] down` (add `-v` to also drop the database volume).

### Environment variables (`.env`, see `.env.example`)

| Variable | Description | Default |
|---|---|---|
| `DB_NAME` | Database name | `task-manager` |
| `DB_PASSWORD` | MariaDB root password | `changeme` |
| `JWT_SECRET` | Secret used to sign API keys - **set a real value** | `changeme` |
| `JWT_EXPIRES_IN` | API key lifetime | `12h` |
| `CORS_ORIGIN` | Origin allowed to call the API | `http://localhost:3000` |
| `REACT_APP_BACKEND_URL` | Backend URL baked into the frontend build | `http://localhost:4000` |
| `BACKEND_PORT` / `FRONTEND_PORT` | Host ports | `4000` / `3000` |

## Manual setup (without Docker)

### Prerequisites

- Node.js 18+
- A running MySQL/MariaDB server

### Backend

```bash
cd backend
npm install
cp .env.example .env   # set DB_* and JWT_SECRET
mysql -u root -p < myDatabase.sql   # creates the database and tables
npm start               # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm start               # http://localhost:3000
```

The frontend talks to `http://localhost:4000` by default; override with a `REACT_APP_BACKEND_URL` env var if your backend runs elsewhere.

> **Note:** this project is built on Create React App (`react-scripts`), which is no longer actively maintained. A `.npmrc` with `legacy-peer-deps=true` is included to avoid peer-dependency resolution errors with newer packages; some `npm audit` warnings come from CRA's own build tooling (webpack-dev-server, svgo, etc.) rather than the app's runtime code.

## API overview

All `/tasks`, `/projects`, and `/subtasks` routes require an `apiKey`, sent either as a `?apiKey=` query parameter or an `apiKey` header. Obtain one via `/users/login`.

| Method | Route | Description |
|---|---|---|
| POST | `/users` | Register a new account |
| POST | `/users/login` | Log in, returns an API key |
| GET | `/users/disconnect` | Invalidate an API key |
| GET/POST | `/tasks` | List / create tasks |
| GET/PUT/DELETE | `/tasks/:id` | Read / update / delete a task |
| GET/POST | `/projects` | List / create projects (with subtasks) |
| GET/PUT/DELETE | `/projects/:id` | Read / update / delete a project |
| GET/POST | `/subtasks/:projectId/subtasks` | List / create subtasks for a project |
| PUT/DELETE | `/subtasks/:projectId/subtasks/:id` | Update / delete a subtask |

`PUT` updates are partial - only send the fields you want to change (e.g. `{ "status": "completed" }` on a task won't touch its title or description).

## Testing

```bash
cd backend && npm test    # Jest + Supertest, database mocked
cd frontend && npm test   # React Testing Library
```

## CI/CD

Two GitHub Actions workflows live in `.github/workflows/`:

- **`ci.yml`** - runs on every push/PR to `main`: installs, tests, and builds both the backend and frontend.
- **`docker-publish.yml`** - on pushes to `main` (and version tags), builds the production Docker images and publishes them to the GitHub Container Registry (`ghcr.io/<owner>/task-manager-backend` and `-frontend`), so `docker compose pull` can fetch them without a local build. GHCR packages are private by default the first time they're published - either make them public in the repo's Packages settings, or run `docker login ghcr.io` before pulling.

## Security notes

- Passwords are hashed with bcrypt; API keys are JWTs signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN`.
- Rate limiting is applied to the auth routes, and security headers are set via `helmet`.
- Set a strong, unique `JWT_SECRET` and `DB_PASSWORD` before deploying anywhere beyond your own machine - the defaults are for local development only.

## License

MIT

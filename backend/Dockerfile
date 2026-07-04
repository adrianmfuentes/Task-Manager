FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Development target: full deps incl. jest/supertest, source bind-mounted
# by docker-compose.dev.yml, runs with --watch for hot reload. ---
FROM base AS dev
RUN npm install
COPY . .
ENV NODE_ENV=development PORT=4000
EXPOSE 4000
CMD ["npm", "run", "dev"]

# --- Production target: prod-only deps, runs as a non-root user. ---
FROM base AS production
RUN npm ci --omit=dev
COPY . .
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node", "server.js"]

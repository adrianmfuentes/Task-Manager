FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .npmrc ./

# --- Development target: CRA dev server with hot reload, source bind-mounted
# by docker-compose.dev.yml. ---
FROM base AS dev
RUN npm install
COPY . .
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
EXPOSE 3000
CMD ["npm", "start"]

# --- Build stage for production: compiles the static bundle. ---
FROM base AS build
RUN npm ci
COPY . .
# Backend URL the browser will call; baked into the static bundle at build time.
ARG REACT_APP_BACKEND_URL=http://localhost:4000
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build

# --- Production target: static bundle served by nginx. ---
FROM nginx:1.27-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

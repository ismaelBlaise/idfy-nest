# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production ----
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=development
ENV PORT=4000

COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4000

# Attendre Postgres puis démarrer Nest
CMD ["sh", "-c", "until nc -z postgres 5432; do echo waiting for db; sleep 2; done; node dist/main.js"]

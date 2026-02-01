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

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

EXPOSE 4000

CMD ["node", "dist/main.js"]

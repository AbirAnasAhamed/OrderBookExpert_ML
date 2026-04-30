# ─────────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ─────────────────────────────────────────────────────────────────
# Stage 1.5: Development (Hot Reloading)
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build-time args for NEXT_PUBLIC_ variables (embedded into JS bundle)
ARG NEXT_PUBLIC_API_URL=http://217.76.59.171:8001
ARG NEXT_PUBLIC_WS_URL=ws://217.76.59.171:8001/ws
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# ─────────────────────────────────────────────────────────────────
# Stage 3: Production runner (minimal image)
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

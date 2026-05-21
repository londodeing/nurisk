FROM node:20-alpine AS builder
RUN apk add --no-cache curl
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY backend/package.json backend/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter @nurisk/backend...

COPY backend/ backend/
COPY packages/ packages/
RUN pnpm turbo build --filter @nurisk/backend

FROM node:20-alpine
RUN apk add --no-cache curl && \
    addgroup -S nurisk && adduser -S nurisk -G nurisk

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=60s \
  CMD curl -f http://localhost:3000/health || exit 1

USER nurisk
CMD ["node", "dist/main.js"]

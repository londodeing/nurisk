FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY frontend-web/package.json frontend-web/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter @nurisk/frontend-web...

COPY frontend-web/ frontend-web/
COPY packages/ packages/
RUN pnpm turbo build --filter @nurisk/frontend-web

FROM nginx:1.25-alpine
RUN rm -rf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/frontend-web/dist /usr/share/nginx/html
COPY frontend-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

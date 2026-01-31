# Dockerfile для Nuxt 4 (Dokploy)
FROM node:22-alpine AS base

# Установка pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ─────────────────────────────────────────────
# Dependencies
# ─────────────────────────────────────────────
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────
FROM base AS builder

# Build args для Nuxt (@nuxtjs/supabase требует их во время билда)
ARG SUPABASE_URL
ARG SUPABASE_KEY
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_KEY=${SUPABASE_KEY}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ─────────────────────────────────────────────
# Production
# ─────────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Создаём пользователя
RUN addgroup --system --gid 1001 nuxt && \
    adduser --system --uid 1001 nuxt

WORKDIR /app

# Копируем только необходимое
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output

USER nuxt

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

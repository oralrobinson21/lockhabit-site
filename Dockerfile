# Soft-safe SSR image for LockHabit (Nitro node-server).
# Soft HOLD: Soft preview hosts only until Oral DNS GO.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .

# Browser-embedded keys must exist at build time for Soft preview.
# Pass Soft TEST values via --build-arg (never bake LIVE secrets into Soft tags).
ARG VITE_SUPABASE_PROJECT_ID=
ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_PUBLISHABLE_KEY=
ARG VITE_STRIPE_MODE=test
ARG VITE_PAYMENTS_CLIENT_TOKEN=
ARG VITE_PAYMENTS_CLIENT_TOKEN_LIVE=

ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_STRIPE_MODE=$VITE_STRIPE_MODE \
    VITE_PAYMENTS_CLIENT_TOKEN=$VITE_PAYMENTS_CLIENT_TOKEN \
    VITE_PAYMENTS_CLIENT_TOKEN_LIVE=$VITE_PAYMENTS_CLIENT_TOKEN_LIVE

RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
USER node
# Matches package.json "start": node .output/server/index.mjs
CMD ["node", ".output/server/index.mjs"]

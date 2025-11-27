# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Include prebuilt SQLite DB
COPY prisma/dev.db ./prisma/dev.db

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build
RUN yarn build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy artifacts and already-installed dependencies (includes dev deps like TypeScript needed to parse next.config.ts)
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["yarn", "start", "-p", "3000"]

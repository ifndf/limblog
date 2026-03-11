FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm/yarn, or use npm
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV DATABASE_URL="file:/tmp/dummy.db"

# Generate Prisma client
RUN npx prisma generate
# Build the Next.js application
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

RUN npm install -g prisma@6

# Ensure the database directory exists
RUN mkdir -p /app/data

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

RUN npm install bcryptjs

# Expose port
EXPOSE 3000

# Run the application
CMD ["sh", "-c", "prisma db push --skip-generate && node prisma/seed.js && node server.js"]
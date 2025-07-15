# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Note: nginx user and group are automatically created when nginx is installed

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create nginx configuration
RUN mkdir -p /etc/nginx/conf.d
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Create supervisor configuration
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy test scripts for debugging
COPY test-nginx.sh /app/test-nginx.sh
COPY test-api.sh /app/test-api.sh
RUN chmod +x /app/test-nginx.sh /app/test-api.sh

# Create directories for nginx and supervisor
RUN mkdir -p /var/log/nginx
RUN mkdir -p /var/log/supervisor
RUN mkdir -p /run/nginx

# Set proper permissions
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nextjs:nodejs /var/log/supervisor
RUN chown -R nginx:nginx /run/nginx

# Ensure nginx can write to its PID file location
RUN mkdir -p /var/run/nginx
RUN chown -R nginx:nginx /var/run/nginx

# Create nginx cache directory and set permissions
RUN mkdir -p /var/cache/nginx
RUN chown -R nginx:nginx /var/cache/nginx

# Ensure nginx has permissions to read its configuration
RUN chown -R nginx:nginx /etc/nginx

EXPOSE 80

# Use supervisor to run both nginx and the Next.js server
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 
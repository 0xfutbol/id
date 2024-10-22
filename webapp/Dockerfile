# Step 1: Build the application
FROM node:20 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock files to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of your application code to the container
COPY . .

# Build the Next.js app
RUN yarn build

# Step 2: Run the application using a minimal image
FROM node:20-slim AS runner

# Set the environment variable to production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/next.config.js /app/package.json /app/public ./public/
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose the port your Next.js app runs on
EXPOSE 3000

# Run the Next.js app
CMD ["yarn", "start"]
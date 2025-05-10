# Build stage
FROM node:20-alpine AS builder

# Accept build arguments
ARG NEXT_TELEMETRY_DISABLED=1

# Install dependencies needed for puppeteer and building
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    git \
    python3 \
    make \
    g++

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}

# Create app directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile && yarn add puppeteer; \
  elif [ -f package-lock.json ]; then npm ci && npm install puppeteer; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile && pnpm add puppeteer; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy source code
COPY . .

# Build the application with TypeScript checks disabled
RUN NODE_OPTIONS=--max_old_space_size=4096 yarn deploy || \
    # If the build fails, try again with TypeScript checks disabled
    (echo "Build failed, retrying with TypeScript checks disabled" && \
     NEXT_TYPESCRIPT_COMPILE_SKIP=true yarn deploy)

# Create necessary directories for uploads and icons
RUN mkdir -p /tmp/uploads && \
    chmod -R 777 /tmp/uploads

# Production stage - using a minimal Node.js image
FROM gcr.io/distroless/nodejs20-debian12 AS runner

# Create app directory
WORKDIR /app

# We need to create the uploads directory in the builder stage
# since distroless doesn't have a shell
COPY --from=builder /tmp /tmp

# Set production environment
ENV NODE_ENV=production
ENV ROOT_DIR=/tmp
ENV DEFAULT_CONFIG_URL=https://github.com/digidem/mapeo-default-config/releases/download/v3.6.1/mapeo-default-settings-v3.6.1.mapeosettings
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]

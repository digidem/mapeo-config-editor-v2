# Use Node.js 20 as the base image
FROM node:20-alpine AS base

# Install dependencies needed for puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install mapeo-settings-builder dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

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

# Build the application
RUN yarn deploy

# Set production environment
ENV NODE_ENV=production
ENV ROOT_DIR=/tmp
ENV DEFAULT_CONFIG_URL=https://github.com/digidem/mapeo-default-config/releases/download/v3.6.1/mapeo-default-settings-v3.6.1.mapeosettings
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

ENV PORT=3000
# Set hostname to listen on all interfaces
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]

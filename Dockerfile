FROM node:18-slim

# Install dependencies and Chrome
RUN apt-get update && apt-get install -yq \
    gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget bzip2 \
    && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm -rf /var/lib/apt/lists/* ./google-chrome-stable_current_amd64.deb
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then PUPPETEER_SKIP_DOWNLOAD=false yarn --frozen-lockfile && yarn add puppeteer; \
  elif [ -f package-lock.json ]; then PUPPETEER_SKIP_DOWNLOAD=false npm ci && npm install puppeteer; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && PUPPETEER_SKIP_DOWNLOAD=false pnpm i --frozen-lockfile && pnpm add puppeteer; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy source code
COPY . .

# Install Puppeteer dependencies and build the project
RUN yarn deploy

# If using npm comment out above and use below instead
# RUN npm run build
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome
ENV chrome_launchOptions_args --no-sandbox,--disable-dev-shm-usage
ENV NODE_ENV production
ENV ROOT_DIR /tmp
ENV DEFAULT_CONFIG_URL https://github.com/digidem/mapeo-default-config/releases/download/v3.6.1/mapeo-default-settings-v3.6.1.mapeosettings
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", ".next/standalone/server.js"]

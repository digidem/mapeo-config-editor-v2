FROM communityfirst/mapeo-settings-builder

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

RUN yarn deploy
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

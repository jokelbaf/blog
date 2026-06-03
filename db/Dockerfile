FROM node:26-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN npm install --global pnpm@latest

COPY website/package.json website/pnpm-lock.yaml website/pnpm-workspace.yaml ./website/

WORKDIR /app/website

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY website/prisma ./prisma
COPY website/prisma.config.ts ./prisma.config.ts

CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

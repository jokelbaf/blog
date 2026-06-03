FROM node:26-bookworm-slim AS node-deps

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /app

RUN npm install --global pnpm@latest

COPY website/package.json website/pnpm-lock.yaml website/pnpm-workspace.yaml ./website/
WORKDIR /app/website
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY website ./
COPY wasm/module/assets/script.js ../wasm/module/assets/script.js
COPY wasm/module/obfuscator.config.json ../wasm/module/obfuscator.config.json
RUN pnpm obfuscate


FROM rust:1-bookworm AS wasm-builder

WORKDIR /app/wasm

RUN rustup target add wasm32-unknown-unknown \
	&& cargo install wasm-pack --locked

COPY wasm/Cargo.toml wasm/Cargo.lock ./
COPY wasm/crypto ./crypto
COPY wasm/macros ./macros
COPY wasm/module ./module
COPY --from=node-deps /app/wasm/module/build/script.obfuscated.js ./module/build/script.obfuscated.js

RUN wasm-pack build module --release --target web


FROM node:26-bookworm-slim AS nuxt-builder

ENV NODE_ENV="production"
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /app

RUN npm install --global pnpm@latest

COPY --from=node-deps /app/website ./website
COPY --from=node-deps /app/website/node_modules ./website/node_modules
COPY --from=wasm-builder /app/wasm/module/pkg ./wasm/module/pkg

WORKDIR /app/website
RUN pnpm build


FROM node:26-bookworm-slim AS runtime

WORKDIR /app

COPY --from=nuxt-builder /app/website/.output ./.output

ENV NODE_ENV="production"

CMD ["node", ".output/server/index.mjs"]

# Blog

My personal blog website.

## Tech Stack

The website consists of two parts: **frontend/backend** and **wasm module**.

For the backend/frontend logic, the following technologies are used:
- Typescript
- Vue / Nuxt v4
- NuxtUI
- TailwindCSS
- Prisma + PostgreSQL (database)

Wasm module is written in Rust and compiled to WebAssembly. The primary purpose is to handle part of the easter egg logic for console image fetching/decryption.

## Development

To run the project locally, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/jokelbaf/blog.git
   cd blog
   ```
2. Install website dependencies:
   ```bash
   cd website
   pnpm i
   ```
3. Obfuscate wasm JS script:
   ```bash
   pnpm obfuscate
   ```
4. Build the wasm module:
   ```bash
   cd ../wasm/module
   wasm-pack build --target web
   ```
5. Set up environment variables:
	Create a `.env` file in the `website` directory and configure env variables. See [`.env.example`](website/.env.example) for reference.
6. Run the development server:
   ```bash
   cd ../../website
   pnpm dev
   ```
7. Open your browser and navigate to `http://localhost:13013` to see the website.

## Production

The production stack runs via Docker Compose. It automatically builds and starts website server and Postgres database, and applies database migrations to ensure the schema is up to date.

1. Set up environment variables in your CI dashboard or locally (`website/.env` file). See [`.env.example`](website/.env.example) for reference.

2. Build and start all services:
   ```bash
   # Locally
   docker-compose --env-file website/.env up -d
   # Or via CI (if envs are set there)
   docker-compose up -d
   ```
   On first start, the `migrate` service runs `prisma migrate deploy` to initialize the database schema, then exits. The website starts only after migrations complete successfully.

3. The website should be available at `http://localhost:13013`.

## License

The project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

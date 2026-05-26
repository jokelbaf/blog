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
2. Build the wasm module:
   ```bash
   cd wasm
   wasm-pack build --target web
   ```
3. Install website dependencies:
   ```bash
   cd ../website
   pnpm i
   ```
3. Set up environment variables:
   Create a `.env` file in the `website` directory and configure env variables. See [`.env.example`](website/.env.example) for reference.
4. Run the development server:
   ```bash
   pnpm dev
   ```
5. Open your browser and navigate to `http://localhost:13013` to see the website.

## Production

TBD.

## License

The project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

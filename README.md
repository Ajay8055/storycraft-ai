# StoryCraft AI

AI-powered product management assistant for Associate Product Managers and Product Managers. Transforms feature briefs into structured user stories, Given/When/Then acceptance criteria, happy paths and alternative flows, edge cases, QA test cases, and requirement gap analysis.

## Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide icons
- **Backend:** Express (`server.ts`) with Vite dev middleware
- **AI Integration:** Server-side `@google/genai` SDK (`gemini-4-hydrogen`) with strict JSON Schema output
- **Persistence:** Local browser storage (`localStorage`) for v1 (no login or external database required)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - In Google AI Studio, open **Settings > Secrets** and add `GEMINI_API_KEY`.
   - For local development outside AI Studio, copy `.env.example` to `.env` and set `GEMINI_API_KEY`:
     ```bash
     cp .env.example .env
     ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```
   The full-stack server starts on `http://localhost:3000` serving both the React app and `/api/generate`.

## Build & Deployment

1. **Typecheck and build the client bundle:**
   ```bash
   npm run lint
   npm run build
   ```

2. **Start the production server:**
   ```bash
   NODE_ENV=production npm start
   ```
   `npm start` executes `node server.ts`, serving the compiled `dist/` bundle alongside `/api/*` endpoints on port `3000` (or the `PORT` environment variable).

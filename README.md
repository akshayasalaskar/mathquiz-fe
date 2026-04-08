# frontend

Backend lives in `../backend` (FastAPI), already implemented.

## Setup

1) Start Redis + MongoDB, then start the backend on port **8000**.

2) Configure env:

- Copy `.env.example` to `.env`
- Adjust `VITE_API_BASE_URL` if needed

3) Install and run:

```bash
npm install
npm run dev
```

## API sync

- REST: `GET {VITE_API_BASE_URL}/leaderboard`
- WS: `ws(s)://{host}/ws?username=...` (HTTPS API URL → **`wss://`** automatically)

## Deploy frontend on Vercel + backend on Render

1. **Backend** is already live, for example: `https://mathquiz-be.onrender.com`

2. **Vercel project**
   - Import the repo (or deploy from the `frontend` folder if the repo is monorepo).
   - **Root Directory**: set to `frontend` if the repo root is `maths-fun`.
   - **Framework Preset**: Vite.

3. **Environment variable** (Vercel → Project → Settings → Environment Variables):
   - Name: `VITE_API_BASE_URL`
   - Value: `https://mathquiz-be.onrender.com` (no trailing slash)
   - Apply to **Production** (and Preview if you use preview deployments with the same backend).

4. **Redeploy** after adding the variable (Vite bakes env in at build time).

5. **WebSockets**
   - With `VITE_API_BASE_URL` on **HTTPS**, the app uses **`wss://mathquiz-be.onrender.com/ws?username=...`**.
   - Your FastAPI CORS is already `allow_origins=["*"]`, so the Vercel origin is allowed for normal REST calls.
   - Render WebSocket connections work on the same URL as HTTP; if the service was cold-starting, the first WS connect can take a few seconds.

6. **SPA routing**: `vercel.json` rewrites all paths to `index.html` so `/play` works on refresh.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

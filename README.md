# Toona Salad

React/Vite frontend and Express API deployed together on Vercel. Wish histories and accounts are stored in MongoDB Atlas. Wish-history JSON uploads go from the browser directly to Vercel Blob, then the records are imported into MongoDB.

## Deploy to Vercel

1. Push this repository to GitHub and import it in Vercel.
2. Keep the Vercel **Root Directory** at the repository root (`./`, the default). This repository itself is the `toonasalad` project; there is no nested `toonasalad` folder.
3. In Project Settings → Environment Variables, add `MONGO_URI` (MongoDB Atlas connection string) and `AUTH_SECRET` (a long random value). Create a Vercel Blob store from Storage and connect it to this project; Vercel supplies `BLOB_READ_WRITE_TOKEN`.
4. In MongoDB Atlas, add a database user and allow Vercel's outbound connections in Network Access. Never commit real connection strings or tokens.
5. Deploy. Vercel runs `npm run build`, serves `client/dist`, and sends `/api/*` to the Express function in `api/[...path].js`.

No `VITE_API_URL` is needed on Vercel: the frontend calls `/api` on the same deployment. For local Vite development, the dev server proxies `/api` to `http://localhost:5000`.

## Local development

Copy `server/.env.example` to `server/.env`, fill in the Atlas URI and a local `AUTH_SECRET`, then run:

```sh
npm install
npm run dev --workspace server
```

In another terminal:

```sh
npm run dev --workspace client
```

To exercise Blob uploads locally, provide a Blob store token in `server/.env` and configure Vercel Blob's local development environment as described in Vercel's Blob docs. Upload-completion callbacks need a publicly reachable callback URL; ordinary local Wish-counter use does not need Blob.

## Wish file uploads

The JSON import button requires a signed-in account and accepts JSON files up to 10 MB. The browser uploads the file directly to Blob using a short-lived token issued by the API. Token issuance checks the account token and restricts uploads to that account's path and `application/json`. Files are configured with public Blob URLs; don't upload private or sensitive data. The parsed wish records are saved in MongoDB as before.

## Commands

```sh
npm test
npm run build
```

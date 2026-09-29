# Contact Book Deployment

## 1. Create MongoDB Atlas

1. Open [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. Create a database user and save its username and password.
3. In **Network Access**, add the IP address used by your deployment. For a learning project, `0.0.0.0/0` allows access from anywhere, but restrict this later.
4. Open **Database > Connect > Drivers**, select Node.js, and copy the connection string.
5. Replace the placeholders in the string and use it as `MONGO_URI`, for example:

   `mongodb+srv://<username>:<password>@<cluster-host>/contact-book?retryWrites=true&w=majority`

## 2. Deploy the server to Render

1. Push this repository to GitHub.
2. In Render, choose **New > Web Service** and select the repository.
3. Set **Root Directory** to `server`.
4. Set **Runtime** to Node, **Build Command** to `npm install`, and **Start Command** to `npm start`.
5. Add these environment variables in Render:

   - `NODE_ENV=production`
   - `MONGO_URI=<your Atlas connection string>`
   - `JWT_SECRET=<long random secret>`
   - `CLIENT_URL=https://<your-vercel-project>.vercel.app`

   Render supplies `PORT` automatically. The server reads it from `process.env.PORT` and falls back to `5000` for local development.
6. Deploy and open `https://<your-render-service>.onrender.com/api/health`. It should return `{"status":"ok"}`.
7. Keep the Render service URL. The client will use it with `/api` appended.

The repository also contains `server/render.yaml`, which can be used as a Render Blueprint. Set the secret `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` values when Render prompts for them.

## 3. Deploy the client to Vercel

1. In Vercel, choose **Add New > Project** and import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Add this environment variable for Production:

   `VITE_API_URL=https://<your-render-service>.onrender.com/api`

5. Deploy the project and copy its production URL.

The template is in `client/.env.production.example`. For local Vite development, the client defaults to `/api`, which is proxied to `http://localhost:5000` by `client/vite.config.js`.

## 4. Update CORS after Vercel deployment

1. In Render, update `CLIENT_URL` to the exact Vercel origin, without a trailing slash:

   `https://<your-vercel-project>.vercel.app`

2. If you use a custom domain, include it too, comma-separated:

   `https://<your-vercel-project>.vercel.app,https://contacts.example.com`

3. Redeploy the Render service. The server allowlists the origins in `CLIENT_URL` and rejects other browser origins in production.
4. Test registration, login, contact CRUD, group CRUD, search, favourites, and stats from the Vercel URL.

For local development, copy `server/.env.example` to `server/.env`, set `MONGO_URI` and `JWT_SECRET`, and keep `CLIENT_URL=http://localhost:5173`.
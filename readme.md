Contact Book — MERN Stack Build Plan (Phase-Wise)

## Run Locally

Prerequisites: Node.js, MongoDB, and the environment values in `server/.env`.

From the repository root, install dependencies once:

```powershell
npm run install:all
```

Start the backend and frontend in separate terminals:

```powershell
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`. The backend health check is available at `http://localhost:5000/api/health`.

For a production client build and backend syntax check:

```powershell
npm run build
npm test
```

A digital phone book: store contacts, organize into groups, mark favourites, quick search. Built with MongoDB, Express, React, Node (MERN) + JWT auth.

0. Data Model & API Map (reference — keep this open in every phase)
Models
User

Field	Type	Notes
name	String	required
email	String	required, unique
password	String	required, hashed with bcrypt
createdAt	Date	default now
Group

Field	Type	Notes
name	String	required, e.g. "Family", "Work"
owner	ObjectId (User)	required
createdAt	Date	default now
Contact

Field	Type	Notes
name	String	required
phone	String	required
email	String	optional
notes	String	optional
group	ObjectId (Group)	optional, nullable
isFavourite	Boolean	default false
owner	ObjectId (User)	required
createdAt	Date	default now
Endpoints
Group	Method & Endpoint	Purpose
Auth (3)	POST /api/auth/register	Register a new user
POST /api/auth/login	Login, receive JWT
GET /api/auth/me	Get logged-in user profile
Contacts (5)	POST /api/contacts	Create a contact
GET /api/contacts	List contacts (paginated)
GET /api/contacts/:id	Get one contact
PUT /api/contacts/:id	Update a contact
DELETE /api/contacts/:id	Delete a contact
Groups (5)	POST /api/groups	Create a group
GET /api/groups	List groups (paginated)
GET /api/groups/:id	Get one group
PUT /api/groups/:id	Update a group
DELETE /api/groups/:id	Delete a group
Special (4)	GET /api/contacts/search?q=	Search contacts by name/phone/email
PATCH /api/contacts/:id/favourite	Toggle favourite on/off
GET /api/contacts/group/:groupId	List contacts in a group
GET /api/contacts/stats	Counts: total, favourites, per group
Auth rule: every endpoint except register/login requires Authorization: Bearer <token> and returns only the logged-in user's own data (filter every query by owner: req.user.id).

Phase 1 — Project Setup & Environment
Goal: Empty but correctly wired repo, both servers running.

Tasks

Create server/ (Node + Express) and client/ (React + Vite)
server: install express, mongoose, bcrypt, jsonwebtoken, dotenv, cors, express-validator, nodemon
client: install react-router-dom, axios, tailwindcss
Set up .env (PORT, MONGO_URI, JWT_SECRET) and .gitignore
Confirm server connects to MongoDB Atlas and returns a health-check route
Confirm React dev server runs and can hit the health-check route via axios

Prompt to give the AI:

Set up a MERN project with two folders: server/ and client/. In server/, initialize an Express app with mongoose, bcryptjs, jsonwebtoken, dotenv, cors, and express-validator installed, using nodemon for dev. Connect to MongoDB using a MONGO_URI from a .env file, and add one health-check route GET /api/health returning {status: "ok"}. In client/, scaffold a React app with Vite, install react-router-dom, axios, and tailwindcss, and configure Tailwind. Add a simple page that calls GET /api/health via axios and displays the response, to confirm both ends are connected. Use the folder layout: server/{models,controllers,routes,middleware,config} and client/src/{pages,components,services,context}.

Phase 2 — Backend: Auth (Models + Auth Endpoints)
Goal: Register/login/me working and testable in Postman.

Tasks

User model (name, email unique, password hashed)
POST /api/auth/register — validate input, hash password, create user, return JWT
POST /api/auth/login — validate credentials, return JWT
GET /api/auth/me — protected, returns current user (no password field)
authMiddleware.js — verifies JWT from Authorization: Bearer <token>, attaches req.user
Proper status codes: 201 (created), 200 (ok), 400 (bad input), 401 (unauthorized), 404 (not found)
Prompt to give the AI:

In the server/ folder from the previous phase, build the authentication system. Create a Mongoose User model with name, email (unique, required), password (required), createdAt. Add a controller and routes for: POST /api/auth/register (validate input with express-validator, hash password with bcrypt, save user, return a signed JWT), POST /api/auth/login (validate credentials, compare hashed password, return JWT), and GET /api/auth/me (protected route returning the logged-in user without the password field). Create an authMiddleware.js that verifies the JWT from the Authorization: Bearer <token> header and attaches the decoded user to req.user, returning 401 if missing/invalid. Use proper status codes throughout (201, 200, 400, 401, 404) and return consistent JSON error shapes like { message: "..." }.

Phase 3 — Backend: Groups & Contacts CRUD
Goal: Full CRUD for Groups and Contacts, scoped per user, with pagination.

Tasks

Group model (name, owner)
Contact model (name, phone, email, notes, group ref, isFavourite, owner)
Group routes: POST/GET(list, paginated)/GET :id/PUT :id/DELETE :id — all under authMiddleware, all scoped to owner: req.user.id
Contact routes: same 5, also scoped to owner, and group field must belong to the same user
Pagination: ?page=&limit= on both list endpoints, returning { data, total, page, pages }
Prompt to give the AI:

Add two new Mongoose models to the existing server: Group (name, owner ref to User, createdAt) and Contact (name, phone, email, notes, group ref to Group [optional], isFavourite boolean default false, owner ref to User, createdAt). Build full CRUD REST APIs for both: POST, GET (list with pagination via ?page=&limit=, returning { data, total, page, pages }), GET /:id, PUT /:id, DELETE /:id. All routes must use the existing authMiddleware, and every query must be scoped to owner: req.user.id so users only ever see or modify their own data. When creating/updating a contact with a group field, verify that group exists and belongs to the same user before saving. Return 404 if a resource isn't found or doesn't belong to the user, 400 for validation errors.

Phase 4 — Backend: Special Features
Goal: Search, favourites, group filter, stats — the features that make this a "contact book" and not just generic CRUD.

Tasks

GET /api/contacts/search?q= — case-insensitive match on name/phone/email
PATCH /api/contacts/:id/favourite — toggle isFavourite
GET /api/contacts/group/:groupId — list contacts in one group (paginated)
GET /api/contacts/stats — { total, favourites, byGroup: [{ groupName, count }] }
Make sure these routes are declared before GET /api/contacts/:id in the router so :id doesn't swallow them
Prompt to give the AI:

Add these four routes to the existing Contact routes/controller, all protected and scoped to req.user.id: (1) GET /api/contacts/search?q=<text> — case-insensitive search matching contact name, phone, or email using a Mongo regex or $or query; (2) PATCH /api/contacts/:id/favourite — flips the isFavourite boolean on that contact and returns the updated contact; (3) GET /api/contacts/group/:groupId — returns paginated contacts belonging to that group, verifying the group belongs to the current user; (4) GET /api/contacts/stats — returns { total, favourites, byGroup: [{ groupId, groupName, count }] } using a Mongo aggregation pipeline. Important: register these routes before the GET /api/contacts/:id route in Express so the router doesn't mistake search, stats, or group for an :id param.

Phase 5 — API Testing in Postman
Goal: Every endpoint verified working before any UI is built.

Tasks

Create a Postman collection with an environment variable {{token}}
Test register → login → save token → me
Test full CRUD for groups and contacts (happy path + 400/401/404 cases)
Test search, favourite toggle, group filter, stats
Confirm a user cannot see/edit another user's contacts (create 2 test users)
Prompt to give the AI:

Generate a Postman collection (as a JSON file I can import) covering every endpoint we've built: auth register/login/me, full CRUD for groups and contacts, and the four special contact endpoints (search, favourite toggle, group filter, stats). Use a collection variable {{baseUrl}} and {{token}}, with the login request auto-saving the returned token into {{token}} via a test script. Include example request bodies and at least one negative test case per resource (missing field → 400, no token → 401, wrong id → 404).

Phase 6 — Frontend: Setup, Routing & Auth Pages
Goal: User can register, log in, and stay logged in (token persisted).

Tasks

services/api.js — axios instance with base URL + interceptor to attach Authorization header
context/AuthContext.jsx — holds user + token, exposes login/register/logout
Pages: Register.jsx, Login.jsx
PrivateRoute component that redirects to /login if not authenticated
React Router setup: /register, /login, / (protected)
Prompt to give the AI:

In client/src, set up an axios instance (services/api.js) that points to the backend base URL and automatically attaches Authorization: Bearer <token> from localStorage to every request. Create an AuthContext (Context API) that stores user and token, persists the token to localStorage, and exposes register(), login(), logout(), and me() functions calling the corresponding API endpoints. Build Login.jsx and Register.jsx pages with form validation and error display. Set up React Router with public routes /login and /register, and a PrivateRoute wrapper that redirects unauthenticated users to /login. Style with Tailwind, keeping it clean and simple.

Phase 7 — Frontend: Contacts & Groups UI
Goal: Core contact book experience — list, add, edit, delete, assign to group.

Tasks

services/contacts.js, services/groups.js — API wrapper functions
Contacts page: paginated list, "Add Contact" modal/form, edit/delete actions
Groups page: list groups, create/edit/delete, contact count per group
Contact form includes a group dropdown (populated from /api/groups)
Loading and empty states
Prompt to give the AI:

Build the main Contact Book UI. Create API wrapper functions for contacts and groups in services/. Build a Contacts page showing a paginated table/list of the logged-in user's contacts (name, phone, group, favourite star), with an "Add Contact" form (modal or separate page) that includes a group dropdown populated from the Groups API, and edit/delete actions per row with confirmation on delete. Build a Groups page listing the user's groups with create/edit/delete, and show the number of contacts in each group. Handle loading and empty states gracefully. Use Tailwind for a clean, mobile-friendly layout.

Phase 8 — Frontend: Favourites & Quick Search
Goal: The features that make this feel like a real phone book, not just a CRUD table.

Tasks

Favourite star icon on each contact, clickable, calls PATCH /favourite, updates UI optimistically
"Favourites" filter/tab showing only favourited contacts
Search bar (debounced) calling GET /api/contacts/search?q=
Group filter tabs/dropdown using GET /api/contacts/group/:groupId
Optional: small stats widget on the dashboard using GET /api/contacts/stats
Prompt to give the AI:

Add these interactive features to the Contacts page: a clickable star icon on each contact that calls PATCH /api/contacts/:id/favourite and updates the UI immediately (optimistic update, rollback on error); a "Favourites" tab/filter that shows only favourited contacts; a debounced search input (300ms) that calls GET /api/contacts/search?q= as the user types and replaces the list with results; and a group filter (dropdown or tabs) that calls GET /api/contacts/group/:groupId. Also add a small stats summary component (total contacts, total favourites, contacts per group) on top of the page using GET /api/contacts/stats.

Phase 9 — Deployment
Goal: Live, working app on free-tier hosting.

Tasks

MongoDB Atlas: create free cluster, whitelist IP (0.0.0.0/0 for now), get connection string
Render: deploy server/ as a Web Service, set env vars (MONGO_URI, JWT_SECRET, CLIENT_URL)
Vercel/Netlify: deploy client/, set VITE_API_URL env var pointing to Render URL
Update CORS on server to allow the deployed frontend origin
Smoke-test register/login/CRUD on the live URLs
Prompt to give the AI:

Prepare this MERN app for deployment on free-tier services. For the server/: add a production-ready cors config that reads allowed origins from an env var, confirm it reads MONGO_URI, JWT_SECRET, and PORT from environment variables (not hardcoded), and add a start script for Render. For the client/: replace any hardcoded API URL with import.meta.env.VITE_API_URL, and add a .env.production template. Give me the exact steps to: (1) create a free MongoDB Atlas cluster and get the connection string, (2) deploy server/ on Render as a Web Service with the right env vars, (3) deploy client/ on Vercel with VITE_API_URL pointing to the Render backend, and (4) update CORS on the server to allow the deployed frontend's origin.

How to use this document
Work through the phases in order. For each phase:

Paste that phase's prompt to your AI coding assistant (Claude Code, Cursor, etc.) in the project's existing repo.
Test the result (Postman for backend phases, the browser for frontend phases) before moving on.
Only move to the next phase once the current one works — each phase builds directly on the last.
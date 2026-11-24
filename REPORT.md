# Assignment 4 – Containerization, Cloud Deployment and CI/CD of a MERN Blog Application

**Course:** Web Application Projects with React (CSE 3395)  
**Name:** ____________  **Roll No.:** ____________  **Section:** ____________

## 1. Links
- GitHub repository: ____________
- Docker Hub (backend): ____________
- Docker Hub (frontend): ____________
- Deployed application: ____________

## 2. Application overview
A blog application where users can view, create, edit and delete posts.
Frontend: React (Vite) with TanStack Query for data fetching and cache invalidation.
Backend: Node.js + Express REST API (`/api/posts`) using Mongoose. Database: MongoDB.

## 3. Role of each tool
| Tool | Role in this project |
|---|---|
| Docker | Packages the frontend (multi-stage: Vite build → nginx) and backend (Node 20 Alpine, non-root) with all dependencies so they run identically everywhere. |
| Docker Compose | Starts mongo, backend and frontend together locally; defines ports, env vars, a mongo healthcheck, start-up order and a persistent volume. |
| Docker Hub | Image registry; CI/CD pushes tagged images that Cloud Run pulls. |
| MongoDB Atlas | Managed cloud database used in production. |
| Google Cloud Run | Serverless container hosting; auto-scales, gives each service a public HTTPS URL. |
| GitHub Actions | CI (install, lint, test/build on push and PR) and CD (build, push, deploy on merge to main). |
| GitHub Secrets | Stores Docker Hub, Google Cloud and MongoDB credentials outside the code. |

## 4. Deployment procedure
1. Wrote Dockerfiles and `.dockerignore` files; built images and ran containers; verified the frontend reaches the API.
2. Wrote `docker-compose.yml`; ran `docker compose up`; tested create/edit/delete.
3. Created an Atlas M0 cluster, DB user and network access; obtained the connection string.
4. Created Docker Hub repositories and pushed both images.
5. Deployed the backend, then the frontend (built with the backend URL) to Cloud Run with environment variables.
6. Pushed the code to GitHub; added CI workflows for frontend and backend.
7. Created a Google Cloud service account, added secrets to GitHub, and added the CD workflow.
8. Verified that a commit to `main` automatically redeploys the application.

## 5. Challenges encountered and solutions
Replace/extend with your own experience; examples of real issues for this stack:
- **Frontend calling the wrong API URL:** Vite embeds `VITE_API_URL` at build time, so it is passed as a Docker build arg and the CD pipeline builds the frontend after the backend is deployed.
- **Cloud Run port:** Cloud Run sends traffic to `$PORT` (8080). The backend reads `process.env.PORT`; nginx uses an envsubst template so it listens on `$PORT`.
- **Atlas connectivity:** Cloud Run has no static IP, so Atlas network access was opened to `0.0.0.0/0` for this assignment.
- **CORS:** The browser calls the API directly, so the backend sets `CORS_ORIGIN`.
- ____________

## 6. Source code implemented
- `backend/src/app.js`, `server.js`, `models/Post.js`, `routes/posts.js`, `tests/posts.test.js`
- `frontend/src/App.jsx`, `api.js`, `components/PostForm.jsx`, `components/PostCard.jsx`
- `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`
- `.github/workflows/ci-backend.yml`, `ci-frontend.yml`, `cd.yml`

## 7. Screenshots
(Paste: docker images / ps; Compose running; Docker Hub; Cloud Run services; Actions CI & CD runs; live app.)

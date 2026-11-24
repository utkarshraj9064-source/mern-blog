# MERN Blog – Docker, Cloud Run and CI/CD

React (Vite) + TanStack Query frontend, Express + Mongoose backend, MongoDB.
Containerised with Docker, orchestrated locally with Docker Compose, deployed to
Google Cloud Run (images from Docker Hub, database on MongoDB Atlas) and automated
with GitHub Actions.

```
mern-blog/
├── backend/            Express API  (+ Dockerfile, .dockerignore, tests, eslint)
├── frontend/           React app    (+ Dockerfile, nginx.conf, .dockerignore, eslint)
├── docker-compose.yml  frontend + backend + mongo
└── .github/workflows/  ci-backend.yml, ci-frontend.yml, cd.yml
```

API: `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/:id`, `GET /api/health`.

---

## 0. Prerequisites
Node 20+, Docker Desktop, Git, a GitHub account, a Docker Hub account,
a MongoDB Atlas account and a Google Cloud account (billing enabled; Cloud Run's free tier is enough).

## 1. Run without Docker (optional sanity check)
```bash
# terminal 1 – MongoDB
docker run -d --name mongo -p 27017:27017 mongo:7

# terminal 2 – backend
cd backend && cp .env.example .env && npm install && npm run dev

# terminal 3 – frontend
cd frontend && cp .env.example .env && npm install && npm run dev   # http://localhost:5173
```
Run the checks: `npm run lint` and (backend, needs Mongo running) `npm test`.

## 2. Task 1 – Docker containers (without Compose)
```bash
docker network create blog-net
docker run -d --name mongo --network blog-net mongo:7

docker build -t blog-backend ./backend
docker run -d --name backend --network blog-net -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/blog -e CORS_ORIGIN=http://localhost:3000 blog-backend

docker build -t blog-frontend --build-arg VITE_API_URL=http://localhost:5000 ./frontend
docker run -d --name frontend -p 3000:8080 blog-frontend

curl http://localhost:5000/api/health      # backend OK
# open http://localhost:3000               # create a post -> proves frontend <-> backend
docker images && docker ps                 # screenshot these
```
Clean up: `docker rm -f frontend backend mongo && docker network rm blog-net`

## 3. Task 2 – Docker Compose
```bash
docker compose up -d --build
docker compose ps            # screenshot
docker compose logs -f backend
# open http://localhost:3000, create / edit / delete posts
docker compose down          # stop (add -v to also delete the DB volume)
```
Compose starts `mongo` (with a healthcheck) → `backend` (waits for healthy mongo) → `frontend`.

## 4. Task 3 – Cloud deployment

### 4.1 MongoDB Atlas
1. cloud.mongodb.com → create a free **M0** cluster.
2. *Database Access* → add a user (username + password).
3. *Network Access* → add IP `0.0.0.0/0` (Cloud Run has no fixed IP; fine for an assignment).
4. *Connect → Drivers* → copy the string and add the DB name:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/blog?retryWrites=true&w=majority`
   (URL-encode special characters in the password.)

### 4.2 Docker Hub
1. hub.docker.com → *Account settings → Personal access tokens* → create a token with **Read & Write**.
2. Create two **public** repositories: `blog-backend` and `blog-frontend`
   (Cloud Run pulls public Docker Hub images directly).

Manual push (the pipeline in section 6 does this automatically):
```bash
docker login
docker tag blog-backend  <dockerhub-user>/blog-backend:latest  && docker push <dockerhub-user>/blog-backend:latest
```

### 4.3 Google Cloud Run (manual first deployment)
```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud services enable run.googleapis.com

# backend
gcloud run deploy blog-backend --region asia-south1 --allow-unauthenticated --port 8080 \
  --image docker.io/<dockerhub-user>/blog-backend:latest \
  --set-env-vars "MONGO_URI=<atlas-uri>,CORS_ORIGIN=*"
# -> note the Service URL, e.g. https://blog-backend-xxxx-el.a.run.app

# frontend: rebuild with the backend URL baked in, push, then deploy
docker build -t <dockerhub-user>/blog-frontend:latest \
  --build-arg VITE_API_URL=https://blog-backend-xxxx-el.a.run.app ./frontend
docker push <dockerhub-user>/blog-frontend:latest
gcloud run deploy blog-frontend --region asia-south1 --allow-unauthenticated --port 8080 \
  --image docker.io/<dockerhub-user>/blog-frontend:latest
```
Open the frontend URL → view and create posts. Screenshot the Cloud Run console and the live site.

> The API URL is compiled into the React bundle at build time (Vite), which is why the
> frontend image must be rebuilt whenever the backend URL changes. The CD workflow handles this.

## 5. Task 4 – Continuous Integration
1. Create an empty GitHub repo, then:
   ```bash
   cd mern-blog
   git init && git add . && git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. **CI – Backend** (`ci-backend.yml`): installs deps, lints, runs Jest tests against a MongoDB service container.
3. **CI – Frontend** (`ci-frontend.yml`): installs deps, lints, builds.
4. Both run on every push to `main` and on every pull request touching their folder.
5. Demonstrate: open a branch, change something, open a PR, screenshot the green checks in the *Actions* tab.

## 6. Task 5 – Continuous Delivery / Deployment

### 6.1 One-time Google Cloud setup (service account for GitHub)
```bash
PROJECT_ID=<PROJECT_ID>
gcloud iam service-accounts create github-deployer --display-name "GitHub Actions deployer"
SA=github-deployer@$PROJECT_ID.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $PROJECT_ID --member serviceAccount:$SA --role roles/run.admin
gcloud projects add-iam-policy-binding $PROJECT_ID --member serviceAccount:$SA --role roles/iam.serviceAccountUser

gcloud iam service-accounts keys create key.json --iam-account $SA
cat key.json        # copy the whole JSON into the GCP_SA_KEY secret, then DELETE key.json
```
(Never commit `key.json`; `.gitignore` does not protect arbitrary filenames, so delete it.)

### 6.2 GitHub repository secrets
*Repo → Settings → Secrets and variables → Actions → New repository secret*

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | your Docker Hub username |
| `DOCKERHUB_TOKEN` | the Docker Hub access token |
| `GCP_SA_KEY` | full contents of `key.json` |
| `MONGO_URI` | the Atlas connection string |

Optional repository *variable* `GCP_REGION` (defaults to `asia-south1`).

### 6.3 What `cd.yml` does on every push/merge to `main`
1. Builds and pushes the backend image to Docker Hub (`latest` + commit SHA tag).
2. Deploys the backend to Cloud Run and captures its URL.
3. Builds the frontend image with `VITE_API_URL` = that backend URL, pushes it.
4. Deploys the frontend to Cloud Run and prints both URLs in the job log.

### 6.4 Demonstrate
Edit something small (e.g. the `<h1>` in `frontend/src/App.jsx`), commit, push/merge to `main`,
watch *Actions → CD*, then refresh the public frontend URL and show the change. Screenshot it.

## 7. Submission checklist
- [ ] Source code zip (this folder)
- [ ] Dockerfiles + `.dockerignore` (backend & frontend), `docker-compose.yml`
- [ ] GitHub repo URL
- [ ] Docker Hub URLs: `https://hub.docker.com/r/<user>/blog-backend` and `.../blog-frontend`
- [ ] Public Cloud Run frontend URL
- [ ] Workflow files in `.github/workflows/`
- [ ] Screenshots: docker images/containers, Compose running, Docker Hub, Cloud Run, Actions CI/CD runs, app in cloud
- [ ] Report (`REPORT.md` – fill in the blanks, export to PDF/Word)

## 8. Troubleshooting
| Symptom | Fix |
|---|---|
| Frontend shows "Could not load posts" | `VITE_API_URL` is wrong – rebuild the frontend image with the right URL; check browser console for CORS errors |
| Backend container exits immediately | Bad `MONGO_URI`; Atlas network access must allow `0.0.0.0/0` |
| Cloud Run: "container failed to start on PORT 8080" | Check logs: `gcloud run services logs read blog-backend`; usually the Mongo URI |
| CD fails at Cloud Run step with permission error | Service account needs `roles/run.admin` and `roles/iam.serviceAccountUser` |
| CD fails pulling image | Docker Hub repo must be **public** (or use an Artifact Registry remote repo) |
| Port 3000/5000 already in use | Change the host side of the port mapping in `docker-compose.yml` |

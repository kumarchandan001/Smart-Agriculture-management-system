# 🚀 Cloud Deployment Guide (100% Free Tier)

This guide walks you through deploying the complete **Smart Agriculture Management System** to production using free cloud tiers:
* **Database**: MongoDB Atlas (Free M0 Shared Cluster)
* **ML Microservice (FastAPI)**: Render / Railway Web Service
* **Backend API (Node.js)**: Render / Railway Web Service
* **Frontend SPA (React 19)**: Vercel / Netlify

---

## Architecture in Production

```
 [ Vercel ] (React Frontend)
     │
     ▼ HTTPS
 [ Render ] (Node.js API) ──► [ MongoDB Atlas ] (Cloud NoSQL DB)
     │
     ▼ HTTPS
 [ Render ] (Python FastAPI Microservice)
```

---

## Step 1: Deploy MongoDB on MongoDB Atlas (Free M0)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Shared (Free M0)** cluster in your closest region (e.g., `AWS / ap-south-1 Mumbai`).
3. Under **Database Access**, create a user (e.g. `smart_agri_admin` with a strong password).
4. Under **Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Copy the connection string:
   ```text
   mongodb+srv://smart_agri_admin:<password>@cluster0.abcde.mongodb.net/smart_agri?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Python ML Microservice on Render

1. Sign up at [render.com](https://render.com) and link your GitHub repository.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Configure:
   * **Root Directory**: `ml-service`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt && python -m ml.train`
   * **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   * **Plan**: Free
4. Click **Deploy Web Service**.
5. Copy your live ML service URL (e.g., `https://smart-agri-ml.onrender.com`).

---

## Step 3: Deploy Node.js Backend on Render

1. On [render.com](https://render.com), click **New +** $\rightarrow$ **Web Service**.
2. Select the same repository and configure:
   * **Root Directory**: `backend`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Plan**: Free
3. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default) |
   | `MONGO_URI` | *Your Atlas connection string from Step 1* |
   | `JWT_SECRET` | *Generate a random 32-character string* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ML_SERVICE_URL` | *Your ML service URL from Step 2 (e.g. `https://smart-agri-ml.onrender.com`)* |
   | `MARKET_API_KEY` | *Your data.gov.in API key* |
4. Click **Deploy Web Service**.
5. Copy your live backend URL (e.g., `https://smart-agri-backend.onrender.com`).

---

## Step 4: Deploy React Frontend on Vercel

1. Sign up at [vercel.com](https://vercel.com) and import your GitHub repo.
2. Configure project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `smart-agro`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | *Your Node.js Backend URL from Step 3 (e.g. `https://smart-agri-backend.onrender.com`)* |
4. Click **Deploy**.
5. Vercel automatically applies [`smart-agro/vercel.json`](file:///c:/Users/Chandan%20Kumar/Desktop/Projects/Smart-Agriculture-management-system/smart-agro/vercel.json) for clean client-side routing.

---

## Step 5: Test the Live URL!

1. Open your new `https://smart-agro-xyz.vercel.app` URL in your browser.
2. Register a new user account.
3. Test Soil Health Analysis, Crop Recommendations, and Machine Learning Predictions!
4. **Put this live URL on the very first line of your resume:**
   ```markdown
   **Smart Agriculture Platform** | [Live Demo](https://smart-agro.vercel.app) | [GitHub](https://github.com/your-username/smart-agriculture)
   ```

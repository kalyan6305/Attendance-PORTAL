# Attendance Management Portal

A full-stack attendance management system with role-based access for Admins and Teachers.

## Features
- **Admin**: Upload student data (Excel), manage teachers, view analytics.
- **Teacher**: Mark attendance for specific branch/year, view lists, export reports.
- **Tech Stack**: React (Vite), FastAPI, MongoDB, Tailwind CSS.

## Prerequisites
- Node.js & npm
- Python 3.8+
- MongoDB Atlas Account (Connection String)

## Local Setup

### 1. Backend
Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` with your credentials:
```env
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/attendance_db
JWT_SECRET=your_super_secret_key
```

Start the server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend
Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## Default Credentials
On first run, an admin account is created automatically if it doesn't exist:
- **Username**: `admin`
- **Password**: `admin123`

## Deployment on Render

### Backend Service
1. Create a new **Web Service** on Render.
2. Connect your repository.
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Environment Variables:
   - `MONGODB_URL`: Your MongoDB Atlas URL.
   - `JWT_SECRET`: A secure random string.
   - `PYTHON_VERSION`: `3.9.0` (optional)

### Frontend Static Site
1. Create a new **Static Site** on Render.
2. Connect your repository.
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL`: The URL of your deployed Backend Service (e.g., `https://attendance-backend.onrender.com/api`).

## Excel Format
The student upload Excel file must have the following columns:
`S.No`, `Roll Number`, `Name`, `Branch`, `Year`

## API Documentation
Once the backend is running, visit `http://localhost:8000/docs` for interactive API Swagger documentation.

# Full Stack Task Management System

A beautiful, full-stack Task Management System featuring a modern interface built with Next.js and a robust backend API powered by Laravel setup for a technical assessment.

## 🚀 Tech Stack

*   **Frontend:** Next.js (React), TypeScript, CSS Modules
*   **Backend:** Laravel 11, PHP 8.2+
*   **Database:** SQLite (Default for local development)
*   **Authentication:** Laravel Sanctum

---

## 🛠️ Local Development Setup

To run this project on your local machine, you will need two terminal windows open: one for the backend API and one for the frontend UI.

### Prerequisites
*   [PHP 8.2+](https://www.php.net/downloads)
*   [Composer](https://getcomposer.org/)
*   [Node.js](https://nodejs.org/en/) & npm

### 1. Backend Setup (Laravel API)
Open your terminal, navigate to the project directory, and follow these steps:

```bash
# Enter the backend directory
cd backend

# Install PHP dependencies
composer install

# Duplicate the example environment file
cp .env.example .env

# Generate a new application key
php artisan key:generate

# Run database migrations to create the tables
php artisan migrate

# Start the Laravel development server
php artisan serve
```
*The backend API will now be running at `http://127.0.0.1:8000`*

### 2. Frontend Setup (Next.js)
Open a **new** terminal window, navigate to the project directory, and run:

```bash
# Enter the frontend directory
cd frontend

# Install JavaScript dependencies
npm install

# Start the Next.js development server
npm run dev
```
*The frontend application will now be running at `http://localhost:3000`*

You can now open your browser and navigate to `http://localhost:3000` to interact with the application.

---

## 💡 Default Accounts & Testing
You can register a new account on the frontend by creating a new account or you can use your own database connections. For rapid testing, the Laravel system provides endpoints for Task operations.

## 🌐 Deployment (Optional)
If you wish to deploy this project online:
1.  **Frontend:** Deploy the `frontend` folder directly to [Vercel](https://vercel.com).
2.  **Backend:** Deploy the `backend` folder to a service like [Render](https://render.com) or [Railway](https://railway.app), and provide an isolated MySQL/PostgreSQL database variables to the `.env` configuration. Ensure `APP_URL` on the backend matches the new production URL.

<div align="center">

# 💼 Job Portal

### A full-featured job listing and application backend built with Node.js & Express

[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Framework-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📌 Overview

**Job Portal** is a production-ready REST API backend built with **Node.js** and **Express.js**. It powers a complete job listing platform — from user authentication and profile management to job CRUD and public listing with pagination.

This project was built as a comprehensive learning and demonstration project to practice real-world backend patterns including JWT authentication, role-based access, file upload with Formidable, input validation, and MySQL integration.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Formidable |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Validation | Custom middleware validators |

---

## ✨ Features

### 🔐 Authentication
- **Register** — create a new account with email verification
- **Login** — JWT-based authentication
- **Logout** — token invalidation
- **Forgot Password** — email-based password reset flow
- **Reset Password** — secure token-verified password change
- **Email Verification** — verify account via email link

### 👤 User Profile
- Get Profile — fetch logged-in user's profile
- Edit Profile — update name, bio, and other details
- Change Password — update password with current password verification
- Delete Account — soft/hard delete user account
- **Profile Image** — upload and update profile picture using Formidable

### 💼 Job Management *(Authenticated)*
- **Create Job** — post a new job listing
- **Update Job** — edit existing job details
- **Delete Job** — remove a job listing
- **List My Jobs** — view all jobs posted by the logged-in user

### 🌐 Public Listing *(No login required)*
- Browse all active job listings
- Show only active/published jobs
- **Basic pagination** — page & limit support

### ✅ Validation & Error Handling
- Required field validation on all endpoints
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Consistent JSON response format
- Global error handler middleware

---

## 📁 Project Structure

```
job-portal/
├── config/
│   └── db.js               # MySQL connection config
├── controllers/
│   ├── authController.js   # Register, Login, Logout, Password
│   ├── userController.js   # Profile CRUD
│   └── jobController.js    # Job CRUD
├── middlewares/
│   ├── authMiddleware.js   # JWT verification
│   └── upload.js           # Formidable file upload handler
├── routes/
│   ├── authRoutes.js       # /api/auth/*
│   ├── userRoutes.js       # /api/user/*
│   └── jobRoutes.js        # /api/jobs/*
├── utils/
│   ├── email.js            # Nodemailer email utility
│   ├── helpers.js          # Shared helper functions
│   └── validators.js       # Input validation helpers
├── index.js                # App entry point
├── package.json
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- MySQL 8

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/MeetOza28/job-portal.git
cd job-portal

# 2. Install dependencies
npm install

# 3. Create a .env file
cp .env.example .env
# Fill in your DB credentials, JWT secret, and email config

# 4. Create the MySQL database
mysql -u root -p
CREATE DATABASE job_portal;

# 5. Run the server
node index.js
```

---

## 🔧 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=job_portal

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login with email & password | ❌ |
| POST | `/logout` | Logout current user | ✅ |
| POST | `/forgot-password` | Send password reset email | ❌ |
| POST | `/reset-password` | Reset password with token | ❌ |
| GET | `/verify-email/:token` | Verify email address | ❌ |

### User Routes — `/api/user`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/profile` | Get logged-in user profile | ✅ |
| PUT | `/profile` | Update profile details | ✅ |
| PUT | `/change-password` | Change account password | ✅ |
| DELETE | `/delete` | Delete user account | ✅ |
| POST | `/upload-image` | Upload profile image | ✅ |

### Job Routes — `/api/jobs`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | List all active jobs (public) | ❌ |
| GET | `/:id` | Get single job details | ❌ |
| GET | `/my-jobs` | List my posted jobs | ✅ |
| POST | `/` | Create a new job | ✅ |
| PUT | `/:id` | Update a job | ✅ |
| DELETE | `/:id` | Delete a job | ✅ |

---

## 📦 Response Format

All endpoints return a consistent JSON response:

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ ... ]
}
```

---

## 👤 Author

**Meet Oza**
- GitHub: [@MeetOza28](https://github.com/MeetOza28)
- LinkedIn: [meetoza28](https://linkedin.com/in/meetoza28)
- Email: meetoza28@gmail.com

---

<div align="center">

⭐ Star this repo if it helped you understand backend development patterns!

</div>

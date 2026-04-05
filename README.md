# 🌉 TalentBridge — Full-Stack Job Portal

A production-ready job portal connecting ambitious talent with exceptional companies. Built with the MERN stack featuring JWT auth, Cloudinary file uploads, Chart.js analytics, and a beautiful light-themed React UI.

---

## ✨ Features at a Glance

| Role | Features |
|------|----------|
| **Job Seeker** | Register/Login · Build profile · Upload resume · Browse & filter jobs · Apply with cover letter · Track application status · Bookmark jobs |
| **Recruiter** | Post/Edit/Delete jobs · View applicants · Update application status · Analytics dashboard with charts |
| **Admin** | Platform statistics · User management (activate/deactivate/delete) · Job moderation |

---

## 🗂 Project Structure

```
jobportal/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary + Multer config
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe
│   │   ├── jobController.js       # CRUD + search/filter/pagination
│   │   ├── applicationController.js # Apply, status updates, analytics
│   │   ├── userController.js      # Admin user management + bookmarks
│   │   └── profileController.js   # Profile CRUD, avatar, resume upload
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + role-based authorize
│   │   └── errorMiddleware.js     # Global error handler + 404
│   ├── models/
│   │   ├── User.js                # User schema (jobseeker/recruiter/admin)
│   │   ├── Job.js                 # Job schema with text index
│   │   ├── Application.js         # Application schema with unique constraint
│   │   └── Profile.js             # Profile schema (seeker + recruiter fields)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── userRoutes.js
│   │   └── profileRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Responsive navbar with role-based links
│   │   │   ├── Footer.jsx
│   │   │   ├── JobCard.jsx        # Reusable job card with bookmark
│   │   │   └── LoadingStates.jsx  # Spinner, PageLoader, SkeletonCard, EmptyState
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state + helpers
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Hero, categories, featured jobs, CTA
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx       # Role toggle (seeker/recruiter)
│   │   │   ├── JobListings.jsx    # Search, filters, pagination
│   │   │   ├── JobDetails.jsx     # Full job view + apply modal
│   │   │   ├── Profile.jsx        # Edit profile, upload avatar/resume
│   │   │   ├── AppliedJobs.jsx    # Track applications by status
│   │   │   ├── Bookmarks.jsx      # Saved jobs
│   │   │   ├── PostJob.jsx        # Create/edit job form
│   │   │   ├── RecruiterDashboard.jsx # Charts + job + applicant management
│   │   │   ├── AdminPanel.jsx     # Platform stats, user/job management
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx                # Routes + protected routes
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + custom design tokens
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
├── TalentBridge_API.postman_collection.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)

---

### 1️⃣ Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2️⃣ Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/jobportal

JWT_SECRET=your_super_long_random_secret_key_here_32chars
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **Getting Cloudinary credentials:** Sign up at [cloudinary.com](https://cloudinary.com) → Dashboard → copy Cloud Name, API Key, API Secret.

---

### 3️⃣ Seed Admin User (Optional)

Create an admin user directly in MongoDB or via the API:

```bash
# Using mongosh
use jobportal
db.users.insertOne({
  name: "Admin User",
  email: "admin@jobportal.com",
  password: "$2a$12$...",  # bcrypt hash of your password
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

Or register normally and change role in MongoDB Atlas UI.

---

### 4️⃣ Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → App running on http://localhost:5173
```

---

## 🌐 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

### Auth Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login user |
| GET | `/auth/me` | Private | Get current user |

### Job Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/jobs` | Public | Get all jobs (search, filter, paginate) |
| GET | `/jobs/:id` | Public | Get single job |
| POST | `/jobs` | Recruiter | Create job |
| PUT | `/jobs/:id` | Recruiter/Admin | Update job |
| DELETE | `/jobs/:id` | Recruiter/Admin | Delete job |
| GET | `/jobs/my-jobs` | Recruiter | Get my posted jobs |

**Query params for GET /jobs:**
```
?search=react&location=NYC&jobType=Full-time&experience=Senior
&salaryMin=50000&salaryMax=150000&skills=React,Node.js
&page=1&limit=10&sort=-createdAt
```

### Application Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/applications/apply/:jobId` | Job Seeker | Apply (multipart/form-data) |
| GET | `/applications/my-applications` | Job Seeker | Get my applications |
| GET | `/applications/job/:jobId` | Recruiter | Get job's applicants |
| PUT | `/applications/:id/status` | Recruiter | Update status |
| GET | `/applications/analytics` | Recruiter | Get analytics data |
| DELETE | `/applications/:id` | Job Seeker | Withdraw application |

### Profile Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile/me` | Private | Get my profile |
| PUT | `/profile/me` | Private | Update profile |
| PUT | `/profile/resume` | Job Seeker | Upload resume (multipart) |
| PUT | `/profile/avatar` | Private | Upload avatar (multipart) |
| GET | `/profile/:userId` | Public | Get profile by user ID |

### User/Admin Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | Get all users |
| GET | `/users/stats` | Admin | Platform statistics |
| PUT | `/users/:id/toggle-status` | Admin | Activate/Deactivate user |
| DELETE | `/users/:id` | Admin | Delete user + data |
| PUT | `/users/bookmark/:jobId` | Job Seeker | Toggle bookmark |
| GET | `/users/bookmarks` | Job Seeker | Get bookmarked jobs |

---

## 🧪 Testing with Postman

1. Import `TalentBridge_API.postman_collection.json` into Postman
2. The collection uses variables: `{{baseUrl}}`, `{{token}}`, `{{jobId}}`, `{{appId}}`
3. Run **Login** first — the test script auto-saves the token
4. All subsequent requests use the saved token automatically

---

## 🎨 UI Design System

### Colors
- **Primary:** Blue `#2e87ff` — CTAs, active states, links
- **Background:** Slate `#f8fafc` — Page background
- **Surface:** White — Cards
- **Text:** Slate `#1e293b` — Headings, `#64748b` — Body

### Typography
- **Display:** Sora (headings, brand)
- **Body:** Plus Jakarta Sans (UI text)
- **Mono:** JetBrains Mono (code)

### Key CSS Classes (global)
```css
.btn-primary    /* Blue filled button */
.btn-secondary  /* White outlined button */
.btn-danger     /* Red filled button */
.btn-ghost      /* Transparent hover button */
.card           /* White card with border + shadow */
.card-hover     /* Card with hover lift effect */
.input          /* Styled form input */
.label          /* Form label */
.badge          /* Status pill */
.badge-blue/green/yellow/red/gray/purple
.section-title  /* h2 page titles */
.page-container /* Max-width centered container */
.text-gradient  /* Blue gradient text */
```

---

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT tokens with configurable expiry
- ✅ Role-based route protection (jobseeker / recruiter / admin)
- ✅ Input validation with validator.js
- ✅ MongoDB injection protection via Mongoose
- ✅ CORS configured for specific origin
- ✅ Duplicate application prevention (unique index)
- ✅ File type + size validation for uploads
- ✅ Global error handler with sanitized messages in production

---

## 📦 Key Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| express | HTTP server & routing |
| mongoose | MongoDB ODM + schema validation |
| jsonwebtoken | JWT generation & verification |
| bcryptjs | Password hashing |
| cloudinary | Cloud file storage |
| multer-storage-cloudinary | Multer adapter for Cloudinary |
| validator | Email, URL, string validation |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable loading |
| nodemon | Dev auto-restart |

### Frontend
| Package | Purpose |
|---------|---------|
| react + react-dom | UI framework |
| react-router-dom v6 | Client-side routing |
| axios | HTTP client with interceptors |
| react-toastify | Toast notifications |
| chart.js + react-chartjs-2 | Analytics charts |
| react-icons | Icon library (HeroIcons) |
| tailwindcss | Utility-first CSS |

---

## 🚀 Production Deployment

### Backend (Render / Railway / Fly.io)
```bash
# Set environment variables in your hosting dashboard
# Build command: npm install
# Start command: node server.js
```

### Frontend (Vercel / Netlify)
```bash
# Build command:
npm run build

# Output directory:
dist

# Environment variable:
VITE_API_URL=https://your-backend.render.com/api
```

> Update `frontend/src/api/axios.js` baseURL for production:
> ```js
> baseURL: import.meta.env.VITE_API_URL || '/api'
> ```

---

## ⚡ Bonus Features Implemented

- ✅ **Pagination** — Backend pagination on all list endpoints; UI pagination controls
- ✅ **Advanced filtering** — Location, job type, experience level, salary range, skills
- ✅ **Bookmark jobs** — Job seekers can save/unsave jobs
- ✅ **Analytics dashboard** — Bar chart (apps per job), Doughnut (status), Line (monthly trend)
- ✅ **Resume upload** — Cloudinary PDF storage, accessible from applications
- ✅ **Job views counter** — Increments on each job detail visit
- ✅ **Application withdrawal** — Job seekers can withdraw pending applications
- ✅ **Recruiter notes** — Recruiters can leave notes when updating application status
- ✅ **Job activate/deactivate** — Recruiters can close jobs without deleting

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

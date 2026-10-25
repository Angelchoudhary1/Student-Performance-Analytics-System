# Smart Student Performance & Predictive Analytics System

A college-level capstone project for **NoSQL & MongoDB** integrating full-stack document database architecture, high-throughput aggregation pipelines, and Python Scikit-Learn Machine Learning for student risk prediction.

---

## 🌟 Key Features

### 1. Real MongoDB Document Modeling & Compound Indexing
- Collections: `users`, `students`, `departments`, `subjects`, `marks`, `attendances`, `predictions`, `systemlogs`.
- Compound unique indexes: `{ student: 1, subject: 1, semester: 1 }` on `marks` & `attendances`.
- Compound search index: `{ department: 1, semester: 1 }` and text index on `{ name: "text", rollNo: "text", email: "text" }`.

### 2. Multi-Stage MongoDB Aggregation Pipelines
- **Core KPIs Aggregation**: `$facet`, `$group`, `$avg`, `$cond` computing live CGPA, pass rates, and at-risk counts.
- **Grade & Attendance Distribution**: `$bucket` and `$group` grouping students across performance tiers.
- **Smart Window Rankings**: `$setWindowFields` with `$denseRank` calculating overall, departmental, and semester ranks in-memory.
- **Multi-Factor At-Risk Detection**: Identifies students with attendance < 75%, CGPA < 6.0, and active backlogs.
- **Database Insights Suite**: Built-in Admin dashboard page to inspect MongoDB collection statistics, index keys, and live pipeline execution latency benchmarks.

### 3. Machine Learning Predictive Intelligence
- **Stack**: Python 3, Scikit-Learn, Pandas, NumPy, Joblib.
- **Trained Models**:
  - `RandomForestRegressor` (\(R^2 = 0.9672\)) for Final CGPA prediction.
  - `RandomForestClassifier` (96.25% Accuracy) for Risk Level Classification (`Critical`, `High`, `Moderate`, `Low`).
  - `PassClassifier` (99.58% Accuracy) for Passing Probability.
- Interactive What-If Simulation Studio with live slider controls.
- Personalized AI prescriptive recommendations for remedial classes, attendance recovery, and study planning.

### 4. Modern SaaS Academic Interface
- React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Hot Toast.
- Light & Dark mode support with persistent preference.
- Tailored role portals for **Admin**, **Faculty**, and **Student**.
- 1-Click Instant Demo Role Switcher.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `password123` | Full access to KPIs, CRUD, Rankings, AI Studio, and Database Insights |
| **Faculty** | `faculty@college.edu` | `password123` | Course grading sheets, daily class session registers, subject performance |
| **Student** | `student@college.edu` | `password123` | Personal CGPA, course marks, attendance meter, AI risk report & action plan |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI in `server/.env`)
- Python 3 (with `scikit-learn`, `pandas`, `numpy`, `joblib`)

### Installation & Seeding

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Seed MongoDB Database**:
   ```bash
   npm run seed
   ```

3. **Train Machine Learning Models**:
   ```bash
   npm run ml:train
   ```

4. **Start Application**:
   - Backend Server:
     ```bash
     npm run server
     ```
     *(Runs on http://localhost:5000)*
   - Frontend Client:
     ```bash
     npm run client
     ```
     *(Runs on http://localhost:5173)*

---

## 📁 Project Structure

```
NOSql/
├── server/
│   ├── config/db.js                 # MongoDB connection & retry handler
│   ├── models/                      # Mongoose models with compound indexes
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Department.js
│   │   ├── Subject.js
│   │   ├── Mark.js
│   │   ├── Attendance.js
│   │   └── Prediction.js
│   ├── controllers/                 # Business logic & CRUD handlers
│   ├── routes/                      # REST API endpoints
│   ├── utils/
│   │   ├── mongoAggregations.js     # Native MongoDB aggregation pipelines
│   │   ├── gradeCalculator.js       # Academic grading rules
│   │   └── mlBridge.js              # Python ML subprocess bridge & fallback engine
│   └── seeder/                      # Seed runner for 35+ students, faculty, marks
├── ml_service/
│   ├── dataset_generator.py         # Generates synthetic academic training data
│   ├── train_model.py               # Random Forest training script
│   ├── predict.py                   # Inference CLI script
│   └── models/                      # Serialized .pkl models
└── client/
    ├── src/
    │   ├── context/                 # AuthContext & ThemeContext
    │   ├── services/                # Axios API services
    │   ├── components/              # StatCard, Modal, RiskBadge, Navbar, Sidebar
    │   └── pages/
    │       ├── LandingPage.jsx      # Public landing page
    │       ├── LoginPage.jsx        # Role-based login with 1-click demo access
    │       ├── admin/               # 12 Admin portal management pages
    │       ├── faculty/             # Faculty grading sheet & attendance registers
    │       └── student/             # Personalized student dashboard & AI report
```

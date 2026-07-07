# AI Customer Feedback Sentiment & Analytics Analyser

An enterprise-grade, full-stack application that centralizes customer feedback from multiple channels, extracts sentiment, themes, and urgency metrics using an AI pipeline (combining Google Gemini LLMs and VADER sentiment lexicons), and provides real-time reports and analytics.

---

## 🛠️ Technology Stack & Architecture

### Backend (Core API)
*   **Web Framework**: FastAPI (Python 3.10+) - Async request lifecycle, automatic Swagger docs, high-performance routing.
*   **Database ORM**: SQLAlchemy 2.0 (Using Repository Pattern to separate queries from controllers).
*   **Database Driver**: Psycopg 3 (PostgreSQL adapter).
*   **AI Engine**: 
    *   **Google GenAI SDK**: Google Gemini `gemini-2.5-flash` model for generating summaries and recommended actions.
    *   **vaderSentiment**: Rule-based lexical analysis for fast, deterministic sentiment extraction.
*   **Authentication**: JWT cookies (secure, HTTPOnly, Lax same-site configuration) and PBKDF2 cryptography for secure password hashing.

### Frontend (User Interface)
*   **Compiler/Bundler**: Vite + React 19 (Dynamic bundle loading using code splitting).
*   **Component UI**: Material UI (MUI v9) - Styled components with a premium, responsive glassmorphism aesthetic.
*   **Visualizations**: Recharts - Dynamic SVG charts for monthly distribution, daily volume, and trend analyses.
*   **Routing**: React Router DOM v7 (protected by route guard authentication).

---

## 📂 Project Architecture Mapping

```text
miniproject/
├── backend/                              # Python FastAPI Backend
│   ├── app/
│   │   ├── core/                         # Configuration settings, Database connectors, security & JWT validation
│   │   │   ├── config.py                 # Pydantic Settings env loader
│   │   │   ├── database.py               # SessionLocal engine setup
│   │   │   └── security.py               # JWT helper functions & Role checks (ensure_admin, ensure_roles)
│   │   ├── models/                       # SQLAlchemy DB Entity Models
│   │   │   ├── feedback.py               # Feedback, FeedbackAIAnalysis, FeedbackStatusLog, FeedbackImportBatch schemas
│   │   │   └── user.py                   # User & Role db entity schemas
│   │   ├── repositories/                 # Repository layer (SQL queries only, decoupled from routes)
│   │   │   ├── feedback_repository.py    # Queries for list, retrieve, updates, and soft deletions
│   │   │   └── user_repository.py        # Queries for user management and authentication
│   │   ├── routers/                      # FastAPI Endpoint controllers (Strictly call Repositories / Services)
│   │   │   ├── ai_router.py              # Endpoint for triggering Gemini AI analysis
│   │   │   ├── auth_router.py            # Endpoint for log in, session details (/me), and log out
│   │   │   ├── dashboard_router.py       # Endpoint for dashboard charts aggregations
│   │   │   ├── feedback_router.py        # Endpoint for CRUD operations & CSV file bulk imports
│   │   │   ├── report_router.py          # Endpoint for month/year analytics summaries
│   │   │   └── user_router.py            # Endpoint for Admin CRUD operations on users
│   │   ├── schemas/                      # Pydantic validation schemas (Request payloads & Response types)
│   │   │   ├── auth_schema.py            # Payloads for logins
│   │   │   ├── feedback_schema.py        # Validation formats for creations, details, list grids
│   │   │   └── user_schema.py            # User registration & updating payloads
│   │   ├── services/                     # Business Logic Layer
│   │   │   ├── ai_service.py             # Integrates Google Gemini API & VADER lexicon analyzer
│   │   │   └── feedback_service.py       # Handles CSV data parsing, encoding checks, validations, and bulk inserts
│   │   └── utils/                        # System helpers
│   │       ├── response.py               # Standardized success response structure
│   │       └── seed.py                   # Database seeder tool (auto-creates roles & default users)
│   ├── requirements.txt                  # Backend Python dependencies
│   └── venv/                             # Virtual environment
└── frontend/                             # React Frontend
    ├── dist/                             # Output build folder
    ├── src/
    │   ├── components/                   # Global components & layout panels
    │   │   ├── AppLayout.jsx             # Responsive main side menu frame wrapper
    │   │   ├── ProtectedRoute.jsx        # Auth guard redirect routing component
    │   │   ├── StatCard.jsx              # Reusable stat visual blocks
    │   │   └── dashboard/                # Moved from pages/dashboard for clean separation
    │   │       ├── DashboardView.jsx     # Dashboard visualization components
    │   │       ├── RecentFeedbackTable.jsx# Live recent feedback log
    │   │       └── DashboardCard.jsx     # Performance index cards
    │   ├── pages/                        # Page-level containers (Dynamic route lazy loading)
    │   │   ├── Login.jsx                 # Login container
    │   │   ├── Dashboard.jsx             # Main dashboard page
    │   │   ├── AddFeedback.jsx           # Create feedback form page
    │   │   ├── FeedbackList.jsx          # Live data grid search table
    │   │   ├── FeedbackDetail.jsx        # Detailed feedback card & analysis profile
    │   │   ├── MonthlyReport.jsx         # Report aggregation & monthly insights page
    │   │   └── UserManagement.jsx        # Admin settings page for team creation
    │   ├── services/
    │   │   └── api.jsx                   # Central Axios client configuration (Deduplicated role maps)
    │   └── utils/
    │       └── roleConfig.js             # User access roles definition & mapping
```

---

## 🛡️ Access Control Policy & Roles

The system uses a Role-Based Access Control (RBAC) mechanism. The application enforces permission controls on both the frontend (Route guards) and backend (FastAPI HTTPExceptions):

| Role Key | System Role Name | UI Access | Allowed API Operations |
| :--- | :--- | :--- | :--- |
| **`admin`** | `Admin` | Access to all pages, user management panel. | Full permissions (Create/Update/Delete Feedback, CRUD Users, Re-analyse, view report/analytics). |
| **`product_analyst`** | `Product Analyst` | Dashboard, Feedback Grid, Detail View, Monthly Reports, Add Feedback. | Create feedback, read reports/analytics, perform imports. |
| **`support_lead`** | `Support Lead` | Dashboard, Feedback Grid, Detail View, Monthly Reports. | Read feedback list, update feedback status, view analytics. (No create user or add feedback). |

---

## 🔑 Seeding & Login Credentials

When database migrations/seeding run, three default user accounts are prepared:

1.  **System Administrator** (Role: `Admin`)
    *   **Email**: `admin@example.com`
    *   **Password**: `admin123`
2.  **Product Analyst** (Role: `Product Analyst`)
    *   **Email**: `analyst@example.com`
    *   **Password**: `analyst123`
3.  **Support Lead** (Role: `Support Lead`)
    *   **Email**: `support@example.com`
    *   **Password**: `support123`

---

## 🔗 REST API Endpoints Overview

| Method | Endpoint | Query / Payload | Required Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | `LoginRequest` payload | *Public* | Logs user in, sets JWT cookie. |
| **GET** | `/auth/me` | *None* | *Any Authenticated* | Retrieves active user profile info. |
| **POST** | `/auth/logout` | *None* | *Any Authenticated* | Clears access token cookie. |
| **GET** | `/feedback` | `search`, `status`, `sentiment`, `theme`, `page`, `limit` | *Any Authenticated* | Fetches active feedbacks. |
| **POST** | `/feedback` | `FeedbackCreateRequest` | `Admin`, `Product Analyst` | Creates single feedback item. |
| **PATCH** | `/feedback/{id}/status` | `FeedbackStatusUpdateRequest` | `Admin`, `Product Analyst`, `Support Lead` | Updates status. |
| **PATCH** | `/feedback/{id}/assign` | `FeedbackAssignRequest` | `Admin`, `Product Analyst` | Assigns team. |
| **DELETE**| `/feedback/{id}` | *None* | `Admin` | Soft-deletes feedback. |
| **POST** | `/feedback/import`| `UploadFile` (multipart CSV) | `Admin`, `Product Analyst` | Bulk uploads CSV data. |
| **GET** | `/dashboard/sentiment` | *None* | *Any Authenticated* | Aggregates dashboard analytics. |
| **GET** | `/reports/monthly`| `month`, `year` query variables | *Any Authenticated* | Computes report metrics. |
| **POST** | `/ai/analyze-feedback`| `AnalyzeFeedbackRequest` | `Admin` | Generates AI analysis. |
| **POST** | `/ai/feedback/{id}/reanalyze` | *None* | `Admin` | Re-analyzes feedback record. |
| **GET** | `/users` | `search`, `role`, `limit` | `Admin` | Lists registered users. |
| **POST** | `/users` | `UserCreateRequest` | `Admin` | Registers a new user. |
| **PUT** | `/users/{id}` | `UserUpdateRequest` | `Admin` | Updates user details. |
| **DELETE**| `/users/{id}` | *None* | `Admin` | Suspends (de-activates) user. |

---

## ⚙️ Configuration & Environment Variables

Create a file named `.env` in the `backend/` directory:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/feedback_sentiment_db
SECRET_KEY=your_secure_hash_secret_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_NAME="AI Customer Feedback Sentiment Analyzer"
APP_VERSION=1.0.0
GEMINI_API_KEY=your_google_gemini_api_key
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
```

---

## 🚀 Setup & Installation Guide

### Step 1: Set Up Backend Services
Open a terminal in the `backend/` folder:

1.  **Configure environment**: Make sure python 3.10+ is installed, then activate the local environment:
    ```bash
    source venv/bin/activate
    ```
2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run Migrations & Seeds**: This creates the tables, inserts default roles, and prepares the three access users:
    ```bash
    python -m app.utils.seed
    ```
4.  **Launch the Server**:
    ```bash
    python -m uvicorn app.main:app --port 8000 --reload
    ```
    Access interactive documentation (Swagger) at [http://localhost:8000/docs](http://localhost:8000/docs).

### Step 2: Set Up Frontend Interface
Open another terminal in the `frontend/` folder:

1.  **Install node packages**:
    ```bash
    npm install
    ```
2.  **Start development server**:
    ```bash
    npm run dev
    ```
    Open the app locally in your browser at [http://localhost:5173](http://localhost:5173).
3.  **Production build**:
    ```bash
    npm run build
    ```
    Compiled, production-ready static assets are generated in `frontend/dist/`.

# 🏦 Bharat Financial Health Engine (BFHE)

An India-specific FinTech platform that calculates your **Financial Health Score (0–100)** and provides personalized financial insights and recommendations.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Redux Toolkit, React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| Security | Helmet, Rate Limiting, Joi Validation |
| Deployment | Vercel (Frontend) + Docker (Backend) + MongoDB Atlas |

---

## 📁 Project Structure

```
bfhe/
├── backend/
│   └── src/
│       ├── config/          # Database connection
│       ├── models/          # Mongoose models
│       │   ├── User.js
│       │   ├── FinancialProfile.js
│       │   ├── Loan.js
│       │   ├── Score.js
│       │   └── Recommendation.js
│       ├── routes/          # API route definitions
│       ├── controllers/     # Business logic
│       ├── services/
│       │   ├── scoringEngine/   # Financial health scoring
│       │   └── recommendationEngine.js
│       ├── middleware/      # Auth, validation, error handling
│       ├── utils/           # JWT helpers
│       └── app.js           # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── dashboard/   # ScoreMeter, MetricCards, Charts, Recommendations
│       │   └── shared/      # Navbar
│       ├── pages/           # Login, Register, Onboarding, Dashboard
│       ├── store/           # Redux slices
│       ├── services/        # Axios API client
│       └── utils/           # Currency formatting
│
├── docker-compose.yml
└── package.json             # Root with concurrent dev scripts
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/bfhe.git
cd bfhe
npm install          # Root devDependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Run Development Servers

```bash
# From root directory - runs both backend and frontend
npm run dev

# Or separately:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:3000
```

### 4. Docker (with MongoDB)

```bash
docker-compose up -d
cd frontend && npm start
```

---

## 🧮 Scoring Engine

The Financial Health Score (0–100) is calculated using 5 weighted components:

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| Debt-to-Income Ratio | 25% | Monthly EMI / Monthly Income |
| Savings Rate | 20% | (Income - Expenses - EMI) / Income |
| Emergency Fund Coverage | 20% | Fund / Monthly Living Cost (months) |
| Credit Utilization | 20% | Credit Balance / Credit Limit |
| Essential Expense Ratio | 15% | Expenses / Monthly Income |

### Score Grades
- **80–100** → Excellent 🟢
- **65–79** → Good 🔵
- **50–64** → Fair 🟡
- **35–49** → Poor 🟠
- **0–34** → Critical 🔴

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### Financial Profile
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/financial-profile` | Get profile |
| POST | `/financial-profile` | Create profile (triggers score) |
| PUT | `/financial-profile` | Update profile (triggers score) |

### Loans
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/loans` | Get all loans |
| POST | `/loans` | Add loan |
| PUT | `/loans/:id` | Update loan |
| DELETE | `/loans/:id` | Soft-delete loan |

### Scores
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/scores/latest` | Get latest score |
| GET | `/scores/history` | Get score history (trend) |

### Recommendations
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/recommendations` | Get recommendations |
| PATCH | `/recommendations/:id/read` | Mark as read |
| PATCH | `/recommendations/:id/dismiss` | Dismiss recommendation |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT authentication with 7-day expiry
- **Helmet.js** for HTTP security headers
- **Rate limiting**: 100 requests/15 min per IP
- **Joi validation** on all inputs
- CORS configured to allowed origins only

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Deploy `build/` folder to Vercel
```

### Backend → Docker
```bash
cd backend
docker build -t bfhe-backend .
docker run -p 5000:5000 --env-file .env bfhe-backend
```

### Database → MongoDB Atlas
1. Create Atlas cluster
2. Update `MONGODB_URI` in backend `.env`

---

## 👥 User Roles

- **Salaried**: Fixed salary, uses standard expense tracking
- **Business (MSME)**: Variable revenue, uses 12-month rolling average

---

## 💡 Recommendation Engine

Rule-based system generating up to **8 personalized recommendations** covering:
- Debt reduction strategies
- Savings rate improvement
- Emergency fund building
- Credit utilization optimization
- Expense control tips
- Tax-saving investment options (Section 80C, NPS)

---

## 🇮🇳 India-Specific Features

- **Indian currency formatting** (₹X,XX,XXX)
- Loan types: Personal, Home, Vehicle, Education, Business, Gold
- Tax advice referencing Section 80C, 80CCD
- Recommendations referencing Indian financial products (PPF, ELSS, NPS, CIBIL)
- Phone validation for Indian numbers (6–9 prefix, 10 digits)

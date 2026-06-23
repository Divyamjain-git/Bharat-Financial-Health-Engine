# 🏦 Bharat Financial Health Engine (BFHE)

An India-specific FinTech platform that calculates your Financial Health Score and provides personalized insights, smart budgeting, and debt reduction strategies to help you achieve financial freedom.

**🌍 Live Demo:** [bfhe.vercel.app](https://bfhe.vercel.app)

---

## 🚀 Technologies Used
- **Frontend:** React.js, React Router, Recharts, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Deployment:** Vercel (Frontend), Render/Docker (Backend)

## ⚡ Run Locally

**1. Clone & Install**
```bash
git clone https://github.com/Divyamjain-git/Bharat-Financial-Health-Engine.git
cd Bharat-Financial-Health-Engine

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

**2. Setup Environment Variables**
Inside the `backend` folder, create a `.env` file and add your MongoDB connection string and JWT secret:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**3. Run the App**
Start both the frontend and backend servers concurrently from the root directory:
```bash
# In the root project directory:
npm run dev
```
Alternatively, you can run them separately:
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm start`

---
*© 2026 Bharat Financial Health Engine. All rights reserved.*

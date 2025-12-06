Payroll Management System

This is a full-stack Payroll Management System that I made as part of my assignment.
The system handles employees, their salary slips, monthly expenses, and an admin panel to manage everything.
I have used React (Vite) for the frontend and Node.js + Express + MongoDB for the backend.
The app also includes charts for salary and expenses and allows downloading salary slips as PDF.

What the project contains
👨‍💼 Admin Side
Admin can log in using the demo credentials.
Admin can create salary slips for employees.
Admin can also edit/update any salary slip.
Every salary slip can be downloaded as a PDF file.
Admin can see all employees in a directory and copy their IDs.
Employee expenses appear under “Pending Expenses”.
Admin can approve or reject expenses, and the UI updates instantly.

👨‍💻 Employee Side
Employees can sign up and log in.
Each employee has their own dashboard.
They can see all their salary slips and also download them as PDF.
Employees can submit their monthly expenses.
They can track the approval status of each submitted expense.
Two charts are shown:
Monthly net salary
Monthly total expenses
Their own Employee ID is visible with a 1-click “Copy ID” button.

Technologies I used
Frontend
React (Vite)
Tailwind CSS
React Router
Axios
Recharts (for charts)
jsPDF (for PDF downloads)

Backend
Node.js
Express.js
MongoDB (Mongoose)
JWT authentication
(includes access + refresh token logic)

Deployment
Backend: Render
Frontend: Vercel

backend/
    src/
        index.js
        config/
        controllers/
        middleware/
        models/
        routes/
    package.json

frontend/
    src/
        api/
        components/
        context/
        pages/
        App.jsx
        main.jsx
    package.json
    vite.config.js
    tailwind.config.js

1. Backend setup
cd backend
npm install

PORT=5000
MONGO_URI=your-mongo-uri
JWT_SECRET=your-secret
REFRESH_SECRET=your-refresh-secret

npm run dev

2. Frontend setup
cd frontend
npm install

VITE_API_BASE_URL=http://localhost:5000

npm run dev

Admin Demo Login
Email: hire-me@anshumat.org
Password: HireMe@2025!


Features Completed (for assignment)
Login + Signup for both roles
Admin dashboard
Employee dashboard
Expense tracking
Salary slip generation and update
Database storing all data
JWT based authentication
Refresh token management
Charts for salary and expense history
PDF export for salary slips
Project fully deployed online

github repo:https://github.com/RitikaDutta0901/Payroll.git
frontend(vercel):https://payroll-oo5a.vercel.app
backend(render):https://payroll-eyjs.onrender.com

Why I chose this tech stack

I used React (Vite) for the frontend because it gives a very fast development environment and works well with Tailwind for building a clean UI quickly.
For the backend, I decided to use Node.js + Express instead of FastAPI because I am more comfortable with JavaScript, and it allowed me to build all APIs in the same language.
I also chose MongoDB because it is easy to work with JSON data and fits payroll and expense records very well.
The authentication flow using JWT (access + refresh tokens) fits nicely with both frontend and backend.
Overall, this stack helped me complete the assignment faster and with cleaner structure.


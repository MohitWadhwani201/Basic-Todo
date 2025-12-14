import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import currentWeekRoutes from "./routes/currentWeek.js";

dotenv.config();
connectDB();

const app = express();

// ✅ CORS CONFIG
const allowedOrigins = [
  "http://localhost:5173", // local Vite
  "http://localhost:3000", // optional
  "https://basic-todo-392x.onrender.com", // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/current-week", currentWeekRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

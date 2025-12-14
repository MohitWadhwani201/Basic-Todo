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
app.use(cors());
app.use(express.json());
app.use("/", (req, res) => {
	res.send("API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/current-week", currentWeekRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on PORT ${process.env.PORT}`));

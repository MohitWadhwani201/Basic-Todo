import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
const router = express.Router();

router.get("/", protect, getCurrentWeek);
export const getCurrentWeek = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.cycleStartDate) {
    user.cycleStartDate = new Date();
    await user.save();
  }

  const start = new Date(user.cycleStartDate);
  const now = new Date();

  const diffDays = Math.floor(
    (now - start) / (1000 * 60 * 60 * 24)
  );

  const weekIndex = Math.floor(diffDays / 7) % 4; // 0–3
  const dayIndex = diffDays % 7; // 0–6

  res.json({ weekIndex, dayIndex });
};
export default router;

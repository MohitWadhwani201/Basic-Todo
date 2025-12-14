import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, (req, res) => {
  const today = new Date();

  // ✅ Monday = 0, Sunday = 6
  const dayIndex = (today.getDay() + 6) % 7;

  // ✅ Calculate week of year (ISO-like, simple & stable)
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const daysPassed = Math.floor(
    (today - startOfYear) / (1000 * 60 * 60 * 24)
  );

  const weekOfYear = Math.floor(daysPassed / 7); // 0–51

  // ✅ Map 52 weeks → 4 habit weeks
  const weekIndex = weekOfYear % 4; // 0–3

  res.json({
    dayIndex,
    weekIndex,
    weekOfYear, // optional (useful for debugging)
  });
});

export default router;

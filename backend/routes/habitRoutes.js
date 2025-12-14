import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createHabit, getHabits, updateHabit, toggleHabitDay, deleteHabit } from "../controllers/habitController.js";

const router = express.Router();

router.post("/", protect, createHabit);
router.get("/", protect, getHabits);
router.put("/:id", protect, updateHabit);

// NEW: toggle week/day
router.patch("/:id/toggle", protect, toggleHabitDay);
router.delete("/:id", protect, deleteHabit);
export default router;

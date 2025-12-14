import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleTask
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, updateTask);

// NEW
router.patch("/:id/toggle", protect, toggleTask);

router.delete("/:id", protect, deleteTask);

export default router;

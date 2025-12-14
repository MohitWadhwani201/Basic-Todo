import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", protect, getStats);

export default router;

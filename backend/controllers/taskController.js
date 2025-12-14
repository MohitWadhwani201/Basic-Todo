import Task from "../models/Task.js";
import Habit from "../models/Habit.js";
import User from "../models/User.js";
export const createTask = async (req, res) => {
	const { title, dayIndex, weekIndex } = req.body;

	const task = await Task.create({
		userId: req.user._id,
		title,
		dayIndex,
		weekIndex,
	});

	res.json(task);
};

export const getTasks = async (req, res) => {
	const week = Number(req.query.week ?? 0);

	const tasks = await Task.find({
		userId: req.user._id,
		weekIndex: week,
	}).sort({ dayIndex: 1 });

	res.json(tasks);
};

export const updateTask = async (req, res) => {
	const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json(task);
};

export const deleteTask = async (req, res) => {
	await Task.findByIdAndDelete(req.params.id);
	res.json({ success: true });
};

export const resetAllData = async (req, res) => {
	try {
		const userId = req.user._id;

		// 1️⃣ Delete all tasks
		await Task.deleteMany({ userId });

		// 2️⃣ Reset habits safely (uncheck only)
		const habits = await Habit.find({ userId });

		for (const habit of habits) {
			habit.weeks = Array.from({ length: 4 }, () => Array(7).fill(false));
			await habit.save();
		}

		// 3️⃣ Reset cycle start date (Week 1 Day 1)
		await User.findByIdAndUpdate(userId, {
			cycleStartDate: new Date(),
		});

		res.json({ success: true });
	} catch (err) {
		console.error("Reset failed:", err);
		res.status(500).json({ message: "Failed to reset data" });
	}
};

// 🔥 NEW — toggle completion
export const toggleTask = async (req, res) => {
	const { completed } = req.body;

	const task = await Task.findByIdAndUpdate(
		req.params.id,
		{
			completed,
			completedAt: completed ? new Date() : null,
		},
		{ new: true }
	);

	res.json(task);
};

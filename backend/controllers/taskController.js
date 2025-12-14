import Task from "../models/Task.js";
import Habit from "../models/Habit.js";

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
    weekIndex: week
  }).sort({ dayIndex: 1 });

  res.json(tasks);
};

export const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};


export const resetAllData = async (req, res) => {
	try {
		const userId = req.user._id;

		// ❌ Delete ALL tasks for this user
		await Task.deleteMany({ userId });

		// ♻️ Reset all habits (uncheck all boxes)
		const habits = await Habit.find({ userId });

		for (const habit of habits) {
			habit.weeks = [
				Array(7).fill(false),
				Array(7).fill(false),
				Array(7).fill(false),
				Array(7).fill(false),
			];
			habit.markModified("weeks");
			await habit.save();
		}

		res.json({
			success: true,
			message: "All tasks deleted and habits reset successfully",
		});
	} catch (err) {
		console.error("RESET ERROR:", err);
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

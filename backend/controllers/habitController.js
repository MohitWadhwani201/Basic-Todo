import Habit from "../models/Habit.js";

// CREATE habit (initial 4-week structure)
export const createHabit = async (req, res) => {
	const habit = await Habit.create({
		userId: req.user._id,
		name: req.body.name,
		weeks: [Array(7).fill(false), Array(7).fill(false), Array(7).fill(false), Array(7).fill(false)],
	});

	res.json(habit);
};

// GET habits
export const getHabits = async (req, res) => {
	const habits = await Habit.find({ userId: req.user._id });
	res.json(habits);
};

// UPDATE habit name
export const updateHabit = async (req, res) => {
	const habit = await Habit.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
	res.json(habit);
};

// TOGGLE a specific week/day
export const toggleHabitDay = async (req, res) => {
	const { weekIndex, dayIndex } = req.body;

	const habit = await Habit.findById(req.params.id);
	if (!habit) return res.status(404).json({ message: "Habit not found" });

	// Ensure structure exists
	if (!habit.weeks || habit.weeks.length !== 4) {
		habit.weeks = [Array(7).fill(false), Array(7).fill(false), Array(7).fill(false), Array(7).fill(false)];
	}

	// Toggle correct day
	habit.weeks[weekIndex][dayIndex] = !habit.weeks[weekIndex][dayIndex];

	habit.markModified("weeks");
	await habit.save();

	res.json(habit);
};
export const deleteHabit = async (req, res) => {
	const habit = await Habit.findOneAndDelete({
		_id: req.params.id,
		userId: req.user._id, // 🔐 ownership check
	});

	if (!habit) {
		return res.status(404).json({ message: "Habit not found" });
	}

	res.json({ success: true });
};

import Task from "../models/Task.js";

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

import Task from "../models/Task.js";
import Habit from "../models/Habit.js";

export const getStats = async (req, res) => {
  const week = Number(req.query.week ?? 0);

  const tasks = await Task.find({
    userId: req.user._id,
    weekIndex: week
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  // Weekly (Mon-Sun)
  const weekly = [0,0,0,0,0,0,0];

  tasks.forEach((t) => {
    if (t.completed) weekly[t.dayIndex]++;
  });

  res.json({
    weekly,
    completedTasks,
    totalTasks
  });
};

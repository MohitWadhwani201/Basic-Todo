import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

		// Allow empty string so new rows can exist
		title: { type: String, default: "" },

		dayIndex: { type: Number, default: 0 }, // 0-6
		weekIndex: { type: Number, default: 0 }, // 0-3

		completed: { type: Boolean, default: false },
		completedAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

export default mongoose.model("Task", taskSchema);

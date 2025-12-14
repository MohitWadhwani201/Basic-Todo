import mongoose from "mongoose";
const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    weeks: {
      type: [[Boolean]],
      default: [
        Array(7).fill(false),
        Array(7).fill(false),
        Array(7).fill(false),
        Array(7).fill(false),
      ],
    },
  },
  { timestamps: true }
);
export default mongoose.model("Habit", habitSchema);
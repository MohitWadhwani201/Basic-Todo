import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  // 🔥 ADD THIS
  cycleStartDate: {
    type: Date,
    default: Date.now, // week 1 day 1 starts here
  },
});

export default mongoose.model("User", userSchema);

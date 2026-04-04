import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "vendor", "admin"],
      default: "student",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    studentId: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    noShowCount: {
      type: Number,
      default: 0,
    },
    penaltyStatus: {
      type: String,
      enum: ["none", "warning", "blocked"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
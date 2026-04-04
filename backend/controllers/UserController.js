import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || "mysecretkey",
    {
      expiresIn: "7d",
    }
  );
};

// Register
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const allowedRoles = ["student", "vendor", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "student";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        noShowCount: newUser.noShowCount,
        penaltyStatus: newUser.penaltyStatus,
        phoneNumber: newUser.phoneNumber,
        studentId: newUser.studentId,
        department: newUser.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        noShowCount: user.noShowCount,
        penaltyStatus: user.penaltyStatus,
        phoneNumber: user.phoneNumber,
        studentId: user.studentId,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get logged-in user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, studentId, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        email,
        phoneNumber,
        studentId,
        department,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        noShowCount: updatedUser.noShowCount,
        penaltyStatus: updatedUser.penaltyStatus,
        phoneNumber: updatedUser.phoneNumber,
        studentId: updatedUser.studentId,
        department: updatedUser.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Update user role/type
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const validRoles = ["student", "vendor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles: student, vendor, admin",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// Update no-show count
export const updateNoShowCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementBy = 1 } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.noShowCount += Number(incrementBy);

    if (user.noShowCount >= 3 && user.noShowCount < 5) {
      user.penaltyStatus = "warning";
    } else if (user.noShowCount >= 5) {
      user.penaltyStatus = "blocked";
    }

    await user.save();

    res.status(200).json({
      message: "No-show count updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update no-show count",
      error: error.message,
    });
  }
};

// Update penalty manually
export const updatePenaltyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { penaltyStatus } = req.body;

    const validStatuses = ["none", "warning", "blocked"];
    if (!validStatuses.includes(penaltyStatus)) {
      return res.status(400).json({
        message: "Invalid penalty status",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { penaltyStatus },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Penalty status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update penalty status",
      error: error.message,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
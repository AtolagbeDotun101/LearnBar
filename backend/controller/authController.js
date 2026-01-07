import jwt from "jsonwebtoken";
import User from "../model/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

//@desc    Register a new user
//@route   POST /api/auth/register
//@access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({  email });
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already in use"
            : "Username already in use",
        success: false,
      });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Login user
//@route   POST /api/auth/login
//@access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password", success: false , statusCode: 400});
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false, statusCode: 401});
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Get user profile
//@route   GET /api/auth/profile
//@access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false , statusCode: 404});
    }
    res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Update user profile
//@route   PUT /api/auth/profile
//@access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email, profileImage },
      { new: true }
    ).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false , statusCode: 404});
    }
    res.status(200).json({
      message: "User profile updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Change user password
//@route   PUT /api/auth/change-password
//@access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false , statusCode: 404});
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect", success: false , statusCode: 401});
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

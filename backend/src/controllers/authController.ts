import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Consistent error responses
const errorResponse = (res: Response, status: number, message: string) => {
  return res.status(status).json({ success: false, message });
};

// Password validation: 8+ chars, 1 uppercase, 1 digit, 1 special char
const PASSWORD_REGEX = /^(?=.{8,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
const PASSWORD_POLICY = "Password must have 8+ chars, an uppercase letter, a digit, and a special char";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return errorResponse(res, 400, "Fill all fields");

    // Lowercase email compare
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return errorResponse(res, 400, "User already exists");

    if (!PASSWORD_REGEX.test(password)) {
      return errorResponse(res, 400, PASSWORD_POLICY);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    errorResponse(res, 500, error.message || "Server error");
  }
};

/**
 * Login an existing user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return errorResponse(res, 400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 400, "Invalid credentials");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    errorResponse(res, 500, error.message || "Server error");
  }
};

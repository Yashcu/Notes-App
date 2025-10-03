import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extends Express Request with userId for authenticated routes.
 */
export interface AuthRequest extends Request {
  userId?: string;
}

// Error messages constant
const ERR_NO_TOKEN = "No token provided";
const ERR_TOKEN_INVALID = "Invalid token";

/**
 * Middleware to protect routes and require JWT authentication.
 */
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  // Should be in format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: ERR_NO_TOKEN,
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: ERR_TOKEN_INVALID,
    });
  }
};

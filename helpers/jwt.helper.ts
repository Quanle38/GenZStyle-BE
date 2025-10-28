import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../types/tableType";

const JWT_SECRET: string = process.env.JWT_SECRET || "your_secret_key";

interface JwtPayload {
  user_id: string;
  email: string;
  role: string;
}

export const generateToken = (user: User): string => {
  if (!user) return "";

  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = {
    issuer: "GenZStyle",
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (user: User): string => {
  if (!user) return "";

  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = {
    issuer: "GenZStyle",
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * ✅ Kiểm tra token hợp lệ
 * @returns payload { user_id, email, role } hoặc null nếu token sai
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("Invalid Token:", error);
    return null;
  }
};

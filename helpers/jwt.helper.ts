// src/helpers/jwt.helper.ts

import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
// Import các loại dữ liệu cần thiết của bạn (ví dụ: User)
import { UserAttributes } from "../models/user.model";

const JWT_SECRET: string = process.env.JWT_SECRET || "UIAUIA_SECRET_KEY_DCM"; // Dùng một key mặc định khác

// Định nghĩa Interface Payload của bạn (nên khớp với trong express.d.ts)
interface JwtPayloadData extends JwtPayload { // extends JwtPayload để có các thuộc tính mặc định như iat, exp
    user_id: string;
    email: string;
    role: string;
}

export const generateToken = (user: UserAttributes): string => {
    if (!user) return "";

    const payload: JwtPayloadData = {
        user_id: user.id,
        email: user.email,
        role: user.role
    };

    const options: SignOptions = {
        issuer: "GenZStyle",
        // Ép kiểu đảm bảo rằng expiresIn là kiểu mà SignOptions chấp nhận
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
    };

    return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (user: UserAttributes): string => {
    if (!user) return "";

    const payload: JwtPayloadData = {
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
export const verifyToken = (token: string): JwtPayloadData | null => {
    try {
        // Ép kiểu kết quả decode
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadData;
        return decoded;
    } catch (error) {
        console.error("Invalid Token:", error);
        return null;
    }
};
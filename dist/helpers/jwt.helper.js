"use strict";
// src/helpers/jwt.helper.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "UIAUIA_SECRET_KEY_DCM"; // Dùng một key mặc định khác
const generateToken = (user) => {
    if (!user)
        return "";
    const payload = {
        user_id: user.id,
        email: user.email,
        role: user.role
    };
    const options = {
        issuer: "GenZStyle",
        // Ép kiểu đảm bảo rằng expiresIn là kiểu mà SignOptions chấp nhận
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateToken = generateToken;
const generateRefreshToken = (user) => {
    if (!user)
        return "";
    const payload = {
        user_id: user.id,
        email: user.email,
        role: user.role
    };
    const options = {
        issuer: "GenZStyle",
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * ✅ Kiểm tra token hợp lệ
 * @returns payload { user_id, email, role } hoặc null nếu token sai
 */
const verifyToken = (token) => {
    try {
        // Ép kiểu kết quả decode
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error("Invalid Token:", error);
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.helper.js.map
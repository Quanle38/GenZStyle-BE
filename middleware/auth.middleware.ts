// Ví dụ: src/middlewares/auth.middleware.ts
import { NextFunction, Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
// 👈 Import hàm verifyToken đã được định nghĩa trong file jwt.helper
import { verifyToken } from "../helpers/jwt.helper";

// KHÔNG CẦN định nghĩa lại JWT_SECRET và import jwt ở đây nếu đã dùng helper
// const JWT_SECRET = process.env.JWT_SECRET || "UIAUIA"; // => Xóa dòng này

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Header Authorization không hợp lệ hoặc thiếu Token"
        });
    }

    const token = authHeader.split(" ")[1];

    // 🔑 SỬ DỤNG HÀM HELPER ĐÃ CÓ
    const userPayload = verifyToken(token);

    if (!userPayload) {
        // Hàm verifyToken sẽ trả về null nếu token bị lỗi Signature, Expired, hoặc sai format.
        return handleError(res, 401, "Invalid or expired token");
    }

    // Gán payload đã giải mã vào req.user.
    // TypeScript cho phép vì ta đã mở rộng interface Request.
    req.user = userPayload;

    next();
};
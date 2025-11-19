// middlewares/auth.middleware.ts
import { NextFunction, Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { verifyToken } from "../helpers/jwt.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { User } from "../models";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const uow = new UnitOfWork();
    
    try {
        // ✅ 1. Verify token
        const authHeader = req.headers["authorization"];
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is missing or invalid"
            });
        }

        const token = authHeader.split(" ")[1];
        const userPayload = verifyToken(token);

        if (!userPayload) {
            return handleError(res, 401, "Invalid or expired token");
        }

        // ✅ 2. Load full user từ DB (tích hợp luôn)
        const user = await uow.users.findById(userPayload.user_id);

        if (!user) {
            return handleError(res, 404, "User not found");
        }

        if (user.is_deleted) {
            return handleError(res, 403, "User account has been deleted");
        }

        // ✅ 3. Inject full user vào request
        req.user = user as User;
        next();
        
    } catch (error: any) {
        console.error("Auth middleware error:", error);
        return handleError(res, 401, error.message || "Authentication failed");
    }
};
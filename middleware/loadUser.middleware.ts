// middlewares/loadUser.middleware.ts
import { NextFunction, Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";

/**
 * ✅ Middleware này phải chạy SAU authMiddleware
 * Nó sẽ lấy full User object từ DB dựa trên req.user.user_id
 */
export const loadUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const uow = new UnitOfWork();
    
    try {
        // ✅ Kiểm tra req.user đã tồn tại (từ authMiddleware)
        if (!req.user || !req.user.user_id) {
            return handleError(res, 401, "User not authenticated");
        }

        // ✅ Lấy full user từ DB
        const user = await uow.users.findById(req.user.user_id);

        if (!user) {
            return handleError(res, 404, "User not found");
        }

        if (user.is_deleted) {
            return handleError(res, 403, "User account has been deleted");
        }

        // ✅ Ghi đè req.user với full User object
        req.user = user as any;

        next();
        
    } catch (error: any) {
        console.error("Load user middleware error:", error);
        return handleError(res, 500, error.message || "Failed to load user");
    }
};
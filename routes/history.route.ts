import { Router } from "express";
import historyController from "../controllers/history.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";

const router = Router();

// Lấy token check userId đó thông qua authMiddleware
router.get("/my-orders", authMiddleware, checkRole([ROLE.USER]), historyController.getOrdersByMe);

export default router;
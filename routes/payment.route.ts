import { Router } from "express";
import favoriteController from "../controllers/favoriteController";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";
import paymentController from "../controllers/payment.controller";

const paymentRouter = Router();
paymentRouter.post("/create", paymentController.createPayment);
paymentRouter.get("/:id/status",paymentController.status);
paymentRouter.post("/webhook",paymentController.wedhook);


export default paymentRouter;

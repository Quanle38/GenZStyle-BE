import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/login",authController.login);
authRouter.post("/refreshToken",authController.refreshToken);
authRouter.post("/logout",authController.logout);
authRouter.post("/register",authController.register);
authRouter.get("/me",authMiddleware ,authController.me);
export default authRouter;

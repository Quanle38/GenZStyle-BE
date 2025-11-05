import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login",authController.login);
authRouter.post("/refreshToken",authController.refreshToken);
authRouter.post("/logout",authController.logout);
authRouter.post("/register",authController.register);
authRouter.get("/me",authController.me);
export default authRouter;

import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";
import upload from "../middleware/upload.middleware";

const authRouter = Router();

// PUBLIC
authRouter.post("/login", authController.login);
authRouter.post("/register", upload.single("file"), authController.register);
authRouter.post("/refreshToken", authController.refreshToken);

// PROTECTED
authRouter.post(
  "/logout",
  authMiddleware,
  checkRole([ROLE.ADMIN, ROLE.USER]),
  authController.logout
);

authRouter.get(
  "/me",
  authMiddleware,
  checkRole([ROLE.ADMIN, ROLE.USER]),
  authController.me
);

export default authRouter;

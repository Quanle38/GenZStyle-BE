import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import multer from "multer";

const upload = multer({storage : multer.memoryStorage()})
const authRouter = Router(); 

authRouter.post("/login",authController.login);
authRouter.post("/refreshToken",authController.refreshToken);
authRouter.post("/logout",authController.logout);
authRouter.post("/register", upload.single("file"),authController.register);
authRouter.get("/me",authMiddleware ,authController.me);
export default authRouter;

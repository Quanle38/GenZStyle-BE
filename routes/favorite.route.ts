import { Router } from "express";
import favoriteController from "../controllers/favoriteController";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";

const favoriteRouter = Router();
favoriteRouter.get("/",authMiddleware,favoriteController.getAllByCurrentUser);
favoriteRouter.post("/toggle",authMiddleware,favoriteController.toggleFavorite);
favoriteRouter.get("/by-id",[authMiddleware, checkRole([ROLE.USER])],favoriteController.getAllByUserId);
export default favoriteRouter;

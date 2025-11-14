import { Router } from "express";
import favoriteController from "../controllers/favoriteController";

const favoriteRouter = Router();
favoriteRouter.get("/all-coupon",favoriteController.getAllByUserId);
favoriteRouter.get("/toggle",favoriteController.toggleFavorite);

export default favoriteRouter;

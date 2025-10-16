import { Router } from "express";
import productController from "../controllers/product.controller";

const productRouter = Router();

productRouter.get("/search", productController.search);

export default productRouter;

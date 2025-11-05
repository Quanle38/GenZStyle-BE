import { Router } from "express";
import productController from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";
const productRouter = Router();

productRouter.get("/", productController.getAll);
productRouter.get("/search", productController.search);
productRouter.get("/:id", productController.getById);

productRouter.post("/create", productController.create);
productRouter.post("/update/:id", [authMiddleware, checkRole([ROLE.ADMIN])],productController.update);
productRouter.delete("/delete/:id", [authMiddleware, checkRole([ROLE.ADMIN])],productController.deleteOne);

export default productRouter;

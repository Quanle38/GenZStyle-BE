import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";
import variantController from "../controllers/variant.controller";
const variantRouter = Router();
variantRouter.get("/", variantController.getAll);
variantRouter.get("/:id", variantController.getById);
variantRouter.post("/create", variantController.create);
variantRouter.post("/autoCreate", variantController.autoImportVariant);
// variantRouter.patch("/update/:id", [authMiddleware, checkRole([ROLE.ADMIN])],variantController.update);
variantRouter.patch("/update/:id",variantController.update);
//variantRouter.delete("/delete/:id", [authMiddleware, checkRole([ROLE.ADMIN])],variantController.deleteOne);
variantRouter.delete("/delete/:id",variantController.deleteOne);

export default variantRouter;

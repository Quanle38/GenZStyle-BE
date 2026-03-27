import { Router } from "express";
import conditionSetController from "../controllers/conditonSet.controller";
import { ROLE } from "../enums/role.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";

const router = Router();
// User : getId, update 
router.patch("/update/:id", [authMiddleware,checkRole([ROLE.ADMIN])],conditionSetController.update);
//ADMIN
router.post("/create",[authMiddleware, checkRole([ROLE.ADMIN])] ,conditionSetController.create);
router.get("/getAll", conditionSetController.getAll);
router.get("/:id", conditionSetController.getById);
router.delete("/:id", [authMiddleware, checkRole([ROLE.ADMIN])],conditionSetController.deleteOne);

export default router;

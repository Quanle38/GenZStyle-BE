import { Router } from "express";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";

const router = Router();
// User : getId, update 
router.patch("/update/:id", [authMiddleware, checkRole([ROLE.ADMIN,ROLE.USER])],userController.update);
//ADMIN
router.post("/create",[authMiddleware, checkRole([ROLE.ADMIN])] ,userController.create);
router.get("/getAll",[authMiddleware, checkRole([ROLE.ADMIN])] , userController.getAll);
router.get("/get/:id",[authMiddleware, checkRole([ROLE.ADMIN])] , userController.getById);
router.delete("/delete/:id", [authMiddleware, checkRole([ROLE.ADMIN])],userController.deleteOne);

export default router;

import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();

router.post("/create", userController.create);
router.get("/getAll", userController.getAll);
router.get("/get/:id", userController.get);
router.patch("/update/:id", userController.update);
router.delete("/delete/:id", userController.deleteOne);

export default router;

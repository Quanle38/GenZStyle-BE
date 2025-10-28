import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();
console.log("before route")
router.post("/create", userController.create);
router.get("/getAll", userController.getAll);
router.get("/get/:id", userController.get);
router.patch("/update/:id", userController.update);
router.delete("/delete/:id", userController.deleteOne);
console.log("deleteOne route")

export default router;
import { Router } from "express";
import userController from "../controllers/user.controller";
const router = Router();

router.delete("", userController.create);
console.log("a")
router.get("/getAll", userController.getAll);
console.log("b")
router.get("/get/:idq", userController.get);
console.log("c")
router.patch("/update/:id", userController.update);
console.log("d")
router.patch("/delete/:id", userController.deleteOne);

export default router
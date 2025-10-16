import type { Express } from "express";
import userRouter from "./user.route";
import productController from "../controllers/product.controller";
import productRouter from "./product.route";
const routeAPI = (app: Express) => {
 app.use("/api/v1/user", userRouter)
  app.use("/api/v1/product", productRouter)
}

export default routeAPI;
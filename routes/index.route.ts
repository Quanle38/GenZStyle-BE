import type { Express } from "express";
import userRouter from "./user.route";
import productRouter from "./product.route";
import authRouter from "./auth.route";
import variantRouter from "./variant.route";

const routeAPI = (app: Express) => {
  app.use("/api/v1/user", userRouter)
  app.use("/api/v1/product", productRouter)
  app.use("/api/v1/auth", authRouter)
  app.use("/api/v1/variant", variantRouter)
}

export default routeAPI;
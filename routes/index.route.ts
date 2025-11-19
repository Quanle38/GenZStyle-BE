import type { Express } from "express";
import userRouter from "./user.route";
import productRouter from "./product.route";
import authRouter from "./auth.route";
import variantRouter from "./variant.route";
import couponRouter from "./coupon.route";
import favoriteRouter from "./favorite.route";
import membershipRouter from "./membership.route";
import cartRouter from "./cart.route";

const routeAPI = (app: Express) => {
  app.use("/api/v1/user", userRouter)
  app.use("/api/v1/product", productRouter)
  app.use("/api/v1/auth", authRouter)
  app.use("/api/v1/variant", variantRouter)
  app.use("/api/v1/coupon", couponRouter)
  app.use("/api/v1/favorite", favoriteRouter)
  app.use("/api/v1/membership", membershipRouter)
  app.use("/api/v1/cart", cartRouter)
  
}

export default routeAPI;
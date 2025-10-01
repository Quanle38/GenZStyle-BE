import type { Express } from "express";
import userRouter from "./user.route";
const routeAPI = (app: Express) => {
 app.use("/api/v1/user", userRouter)
}

export default routeAPI;
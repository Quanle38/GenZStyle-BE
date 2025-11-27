import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routeAPI from "./routes/index.route";
import { connectDB } from "./config/connection";
import { sequelize } from "./models/index";
import { setupSwagger } from "./swagger";   // <-- thêm

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Swagger
setupSwagger(app);  // <-- thêm

// Mount routes
routeAPI(app);

// DB
connectDB();
sequelize.sync({ alter: true });

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

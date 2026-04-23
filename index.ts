import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routeAPI from "./routes/index.route";
import { connectDB } from "./config/connection";
import { sequelize } from "./models/index";
import { setupSwagger } from "./swagger";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ⭐ CORS must be FIRST middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jacques-nonperfected-keeley.ngrok-free.dev", // ⭐ Cho phép Postman gọi qua ngrok
      "https://web.postman.co", // ⭐ Cho Postman Web
      "http://localhost:5000",
      "*", // ⭐ Cho phép mọi domain (Postman Desktop sẽ hoạt động)
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400,
  })
);

// ⭐ Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ⭐ Swagger
setupSwagger(app);

// ⭐ Logger
app.use((req, res, next) => {
  console.log("=".repeat(60));
  console.log(`📨 ${new Date().toISOString()}`);
  console.log(`${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("=".repeat(60));
  next();
});

// ⭐ Routes
routeAPI(app);

// ⭐ Database
connectDB();
sequelize.sync({ alter: true });

// ⭐ 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
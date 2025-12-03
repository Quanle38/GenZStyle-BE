import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routeAPI from "./routes/index.route";
import { connectDB } from "./config/connection";
import { sequelize } from "./models/index";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CRITICAL: CORS must be the FIRST middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400 // 24 hours
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log('='.repeat(50));
  console.log(`📨 ${new Date().toISOString()}`);
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('='.repeat(50));
  next();
});

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
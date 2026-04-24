"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const connection_1 = require("./config/connection");
const index_1 = require("./models/index");
const swagger_1 = require("./swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// ⭐ CORS must be FIRST middleware
app.use((0, cors_1.default)({
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
}));
// ⭐ Body parsers
app.use(express_1.default.json({ limit: "5mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// ⭐ Swagger
(0, swagger_1.setupSwagger)(app);
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
(0, index_route_1.default)(app);
// ⭐ Database
(0, connection_1.connectDB)();
index_1.sequelize.sync({ alter: true });
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
//# sourceMappingURL=index.js.map
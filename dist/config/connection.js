"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.sequelize = new sequelize_1.Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log("✅ PostgreSQL connected successfully!");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=connection.js.map
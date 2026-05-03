"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const promises_1 = __importDefault(require("node:dns/promises"));
promises_1.default.setServers(["1.1.1.1", "1.0.0.1"]);
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        await mongoose_1.default.connect(uri);
        console.log('✅ MongoDB connected');
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err);
        (0, exports.connectDB)();
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map
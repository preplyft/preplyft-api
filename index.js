"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const route_1 = __importDefault(require("./routes/route"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ── Security & utility middleware ───────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// ── Global rate limiter ─────────────────────────────────────────────────────
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
}));
// Stricter rate limit on auth endpoints
app.use('/api/v1/auth', (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many auth attempts, please try again later.' },
}));
// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.get("/", (req, res) => {
    res.json({ message: "Hello from Vercel 🚀" });
});
// ── API routes ──────────────────────────────────────────────────────────────
app.use('/api/v1', route_1.default);
// ── Error handling ──────────────────────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ── Bootstrap ───────────────────────────────────────────────────────────────
const start = async () => {
    await (0, db_1.connectDB)();
    await (0, redis_1.connectRedis)();
    //   app.listen(PORT, () => {
    //   console.log(`🚀 Server running at http://localhost:${PORT}/api/v1`);
    // });
};
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
exports.default = (0, serverless_http_1.default)(app);
//# sourceMappingURL=index.js.map
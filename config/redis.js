"use strict";
// import Redis from 'ioredis';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redis = void 0;
// const REDIS_HOST: string = process.env.REDIS_HOST as string; 
// const redis = new Redis(, {
//   lazyConnect: true,
//   maxRetriesPerRequest: 3,
// });
// redis.on('connect', () => console.log('✅ Redis connected'));
// redis.on('error', (err) => console.error('❌ Redis error:', err));
// export default redis;
const ioredis_1 = __importDefault(require("ioredis"));
let redis;
const connectRedis = () => {
    if (redis)
        return redis;
    const host = process.env.REDIS_HOST;
    const password = process.env.REDIS_PASSWORD;
    const port = parseInt(process.env.REDIS_PORT);
    const username = process.env.REDIS_USERNAME;
    if (!host)
        throw new Error("REDIS_URL is not defined in environment variables");
    exports.redis = redis = new ioredis_1.default({
        port: port,
        host: host,
        username: username,
        password: password,
    });
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("❌ Redis error:", err));
    redis.on("reconnecting", () => console.warn("⚠️  Redis reconnecting..."));
    return redis;
};
exports.connectRedis = connectRedis;
//# sourceMappingURL=redis.js.map
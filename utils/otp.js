"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.storeOtp = exports.generateOtp = void 0;
const redis_1 = require("../config/redis");
const OTP_PREFIX = 'otp:';
const OTP_TTL = Number(process.env.OTP_EXPIRES_IN || 10) * 60; // seconds
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.generateOtp = generateOtp;
const storeOtp = async (email, otp, purpose) => {
    const key = `${OTP_PREFIX}${purpose}:${email}`;
    await redis_1.redis.set(key, otp, 'EX', OTP_TTL);
};
exports.storeOtp = storeOtp;
const verifyOtp = async (email, otp, purpose) => {
    const key = `${OTP_PREFIX}${purpose}:${email}`;
    const stored = await redis_1.redis.get(key);
    if (!stored || stored !== otp)
        return false;
    await redis_1.redis.del(key);
    return true;
};
exports.verifyOtp = verifyOtp;
//# sourceMappingURL=otp.js.map
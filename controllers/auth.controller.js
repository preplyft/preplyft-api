"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.login = exports.resendOtp = exports.verifyEmail = exports.register = void 0;
const zod_1 = require("zod");
const User_1 = require("../models/User");
const redis_1 = require("../config/redis");
const mailer_1 = require("../config/mailer");
const otp_1 = require("../utils/otp");
const jwt_1 = require("../utils/jwt");
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
// POST /auth/register
const register = async (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        role: zod_1.z.enum(['student', 'instructor']).default('student'),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
    }
    const { name, email, password, role } = parsed.data;
    const exists = await User_1.User.findOne({ email });
    if (exists) {
        res.status(409).json({ message: 'Email already registered' });
        return;
    }
    const user = await User_1.User.create({ name, email, password, role });
    const otp = (0, otp_1.generateOtp)();
    await (0, otp_1.storeOtp)(email, otp, 'verify');
    await (0, mailer_1.sendOtpEmail)(email, otp, 'Verify your Preplyft account');
    res.status(201).json({ message: 'Registered successfully. Please verify your email with the OTP sent.' });
};
exports.register = register;
// POST /auth/verify-email
const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400).json({ message: 'Email and OTP are required' });
        return;
    }
    const valid = await (0, otp_1.verifyOtp)(email, otp, 'verify');
    if (!valid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
    }
    await User_1.User.findOneAndUpdate({ email }, { isEmailVerified: true });
    res.json({ message: 'Email verified successfully' });
};
exports.verifyEmail = verifyEmail;
// POST /auth/resend-otp
const resendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    const user = await User_1.User.findOne({ email });
    if (!user) {
        // Don't reveal if user exists or not
        res.json({ message: 'OTP resent successfully' });
        return;
    }
    const otp = (0, otp_1.generateOtp)();
    await (0, otp_1.storeOtp)(email, otp, 'verify');
    await (0, mailer_1.sendOtpEmail)(email, otp, 'Your Preplyft verification OTP');
    res.json({ message: 'OTP resent successfully' });
};
exports.resendOtp = resendOtp;
// POST /auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    const user = await User_1.User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    if (!user.isEmailVerified) {
        res.status(401).json({ message: 'Please verify your email first' });
        return;
    }
    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    await redis_1.redis.set(`refresh:${user._id}`, refreshToken, 'EX', REFRESH_TTL);
    res.json({
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
};
exports.login = login;
// POST /auth/refresh-token
const refreshToken = async (req, res) => {
    const { refreshToken: token } = req.body;
    if (!token) {
        res.status(400).json({ message: 'Refresh token required' });
        return;
    }
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const stored = await redis_1.redis.get(`refresh:${payload.id}`);
        if (!stored || stored !== token) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const accessToken = (0, jwt_1.signAccessToken)({ id: payload.id, role: payload.role });
        res.json({ accessToken });
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
exports.refreshToken = refreshToken;
// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    // Always return 200 to prevent email enumeration
    const RESPONSE = { message: 'If that email exists, an OTP has been sent' };
    if (!email) {
        res.json(RESPONSE);
        return;
    }
    const user = await User_1.User.findOne({ email });
    if (user) {
        const otp = (0, otp_1.generateOtp)();
        await (0, otp_1.storeOtp)(email, otp, 'reset');
        await (0, mailer_1.sendOtpEmail)(email, otp, 'Reset your Preplyft password');
    }
    res.json(RESPONSE);
};
exports.forgotPassword = forgotPassword;
// POST /auth/reset-password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        res.status(400).json({ message: 'Email, OTP, and new password are required' });
        return;
    }
    const valid = await (0, otp_1.verifyOtp)(email, otp, 'reset');
    if (!valid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
    }
    const user = await User_1.User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
};
exports.resetPassword = resetPassword;
// POST /auth/logout 🔒
const logout = async (req, res) => {
    if (req.user?.id) {
        await redis_1.redis.del(`refresh:${req.user.id}`);
    }
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
// GET /auth/me 🔒
const getMe = async (req, res) => {
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json(user);
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map
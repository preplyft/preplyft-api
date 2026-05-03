"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = (0, jwt_1.verifyAccessToken)(token);
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = (0, jwt_1.verifyAccessToken)(token);
        }
        catch {
            // ignore — optional
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        return;
    }
    next();
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map
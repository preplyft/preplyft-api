"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/presigned-url', auth_1.authenticate, (0, auth_1.authorize)('instructor'), upload_controller_1.getPresignedUrl);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map
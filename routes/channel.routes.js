"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const channel_controller_1 = require("../controllers/channel.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', channel_controller_1.getChannels);
router.get('/mine', auth_1.authenticate, (0, auth_1.authorize)('instructor'), channel_controller_1.getMyChannels);
router.get('/:id', channel_controller_1.getChannel);
router.post('/', auth_1.authenticate, channel_controller_1.createChannel);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('instructor'), channel_controller_1.updateChannel);
router.post('/:id/subscribe', auth_1.authenticate, channel_controller_1.toggleSubscribe);
exports.default = router;
//# sourceMappingURL=channel.routes.js.map
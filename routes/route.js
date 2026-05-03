"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const upload_routes_1 = __importDefault(require("./upload.routes"));
const channel_routes_1 = __importDefault(require("./channel.routes"));
const video_routes_1 = __importDefault(require("./video.routes"));
const course_routes_1 = __importDefault(require("./course.routes"));
const playlist_routes_1 = __importDefault(require("./playlist.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/upload', upload_routes_1.default);
router.use('/channels', channel_routes_1.default);
router.use('/videos', video_routes_1.default);
router.use('/courses', course_routes_1.default);
router.use('/playlists', playlist_routes_1.default);
exports.default = router;
//# sourceMappingURL=route.js.map
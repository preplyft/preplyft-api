"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const video_controller_1 = require("../controllers/video.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Order matters — specific routes before parameterised ones
router.get('/', video_controller_1.getVideos);
router.get('/bookmarks', auth_1.authenticate, video_controller_1.getBookmarks);
router.get('/:id', auth_1.optionalAuth, video_controller_1.getVideo);
router.get('/:id/comments', video_controller_1.getComments);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('instructor'), video_controller_1.createVideo);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('instructor'), video_controller_1.updateVideo);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('instructor'), video_controller_1.deleteVideo);
router.post('/:id/like', auth_1.authenticate, video_controller_1.toggleLike);
router.post('/:id/bookmark', auth_1.authenticate, video_controller_1.toggleBookmark);
router.post('/:id/comments', auth_1.authenticate, video_controller_1.addComment);
exports.default = router;
//# sourceMappingURL=video.routes.js.map
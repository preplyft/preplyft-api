"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playlist_controller_1 = require("../controllers/playlist.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, playlist_controller_1.getPlaylists);
router.get('/:id', auth_1.optionalAuth, playlist_controller_1.getPlaylist);
router.post('/', auth_1.authenticate, playlist_controller_1.createPlaylist);
router.patch('/:id', auth_1.authenticate, playlist_controller_1.updatePlaylist);
router.delete('/:id', auth_1.authenticate, playlist_controller_1.deletePlaylist);
router.post('/:id/videos', auth_1.authenticate, playlist_controller_1.addVideoToPlaylist);
router.delete('/:id/videos/:videoId', auth_1.authenticate, playlist_controller_1.removeVideoFromPlaylist);
exports.default = router;
//# sourceMappingURL=playlist.routes.js.map
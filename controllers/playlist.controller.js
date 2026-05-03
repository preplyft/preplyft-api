"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeVideoFromPlaylist = exports.addVideoToPlaylist = exports.deletePlaylist = exports.updatePlaylist = exports.createPlaylist = exports.getPlaylist = exports.getPlaylists = void 0;
const Playlist_1 = require("../models/Playlist");
// GET /playlists 🔒
const getPlaylists = async (req, res) => {
    const playlists = await Playlist_1.Playlist.find({ user: req.user.id })
        .populate('videos', 'title thumbnail duration')
        .sort({ createdAt: -1 });
    res.json(playlists);
};
exports.getPlaylists = getPlaylists;
// GET /playlists/:id
const getPlaylist = async (req, res) => {
    const playlist = await Playlist_1.Playlist.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('videos', 'title thumbnail duration channel');
    if (!playlist) {
        res.status(404).json({ message: 'Playlist not found' });
        return;
    }
    const isOwner = req.user && playlist.user._id.toString() === req.user.id;
    if (!playlist.isPublic && !isOwner) {
        res.status(403).json({ message: 'This playlist is private' });
        return;
    }
    res.json(playlist);
};
exports.getPlaylist = getPlaylist;
// POST /playlists 🔒
const createPlaylist = async (req, res) => {
    const { name, isPublic } = req.body;
    if (!name) {
        res.status(400).json({ message: 'Playlist name is required' });
        return;
    }
    const playlist = await Playlist_1.Playlist.create({
        name,
        isPublic: isPublic ?? false,
        user: req.user.id,
    });
    res.status(201).json(playlist);
};
exports.createPlaylist = createPlaylist;
// PATCH /playlists/:id 🔒
const updatePlaylist = async (req, res) => {
    const playlist = await Playlist_1.Playlist.findById(req.params.id);
    if (!playlist) {
        res.status(404).json({ message: 'Playlist not found' });
        return;
    }
    if (playlist.user.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your playlist' });
        return;
    }
    const { name, isPublic } = req.body;
    if (name !== undefined)
        playlist.name = name;
    if (isPublic !== undefined)
        playlist.isPublic = isPublic;
    await playlist.save();
    res.json(playlist);
};
exports.updatePlaylist = updatePlaylist;
// DELETE /playlists/:id 🔒
const deletePlaylist = async (req, res) => {
    const playlist = await Playlist_1.Playlist.findById(req.params.id);
    if (!playlist) {
        res.status(404).json({ message: 'Playlist not found' });
        return;
    }
    if (playlist.user.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your playlist' });
        return;
    }
    await playlist.deleteOne();
    res.json({ message: 'Playlist deleted' });
};
exports.deletePlaylist = deletePlaylist;
// POST /playlists/:id/videos 🔒
const addVideoToPlaylist = async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        res.status(400).json({ message: 'videoId is required' });
        return;
    }
    const playlist = await Playlist_1.Playlist.findById(req.params.id);
    if (!playlist) {
        res.status(404).json({ message: 'Playlist not found' });
        return;
    }
    if (playlist.user.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your playlist' });
        return;
    }
    if (playlist.videos.some((v) => v.toString() === videoId)) {
        res.status(409).json({ message: 'Video already in playlist' });
        return;
    }
    playlist.videos.push(videoId);
    await playlist.save();
    const updated = await Playlist_1.Playlist.findById(playlist._id).populate('videos', 'title thumbnail duration');
    res.json(updated);
};
exports.addVideoToPlaylist = addVideoToPlaylist;
// DELETE /playlists/:id/videos/:videoId 🔒
const removeVideoFromPlaylist = async (req, res) => {
    const playlist = await Playlist_1.Playlist.findById(req.params.id);
    if (!playlist) {
        res.status(404).json({ message: 'Playlist not found' });
        return;
    }
    if (playlist.user.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your playlist' });
        return;
    }
    playlist.videos = playlist.videos.filter((v) => v.toString() !== req.params.videoId);
    await playlist.save();
    const updated = await Playlist_1.Playlist.findById(playlist._id).populate('videos', 'title thumbnail duration');
    res.json(updated);
};
exports.removeVideoFromPlaylist = removeVideoFromPlaylist;
//# sourceMappingURL=playlist.controller.js.map
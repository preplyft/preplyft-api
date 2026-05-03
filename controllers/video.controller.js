"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.toggleBookmark = exports.toggleLike = exports.deleteVideo = exports.updateVideo = exports.createVideo = exports.getComments = exports.getVideo = exports.getBookmarks = exports.getVideos = void 0;
const Video_1 = require("../models/Video");
const Channel_1 = require("../models/Channel");
const pagination_1 = require("../utils/pagination");
// GET /videos
const getVideos = async (req, res) => {
    const { q, channelId } = req.query;
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const filter = { visibility: 'public' };
    if (q)
        filter.$text = { $search: q };
    if (channelId)
        filter.channel = channelId;
    const [videos, total] = await Promise.all([
        Video_1.Video.find(filter)
            .select('title description videoUrl thumbnail duration visibility views likeCount commentCount channel createdAt updatedAt')
            .populate('channel', 'name icon')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Video_1.Video.countDocuments(filter),
    ]);
    res.json({ videos, pagination: (0, pagination_1.buildPaginationResult)(total, page, limit) });
};
exports.getVideos = getVideos;
// GET /videos/bookmarks 🔒
const getBookmarks = async (req, res) => {
    const videos = await Video_1.Video.find({ bookmarks: req.user.id, visibility: 'public' })
        .populate('channel', 'name icon');
    res.json(videos);
};
exports.getBookmarks = getBookmarks;
// GET /videos/:id
const getVideo = async (req, res) => {
    const video = await Video_1.Video.findById(req.params.id)
        .populate('channel', 'name icon')
        .populate('comments.user', 'name');
    if (!video || video.visibility === 'private') {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    // Increment views
    video.views += 1;
    await video.save();
    const plain = video.toObject();
    // Reshape comments for response
    plain.comments = plain.comments.map((c) => ({
        _id: c._id,
        user: c.user._id,
        name: c.user.name,
        text: c.text,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }));
    if (req.user) {
        const uid = req.user.id;
        plain.isLiked = video.likes.some((l) => l.toString() === uid);
        plain.isBookmarked = video.bookmarks.some((b) => b.toString() === uid);
    }
    delete plain.likes;
    delete plain.bookmarks;
    res.json(plain);
};
exports.getVideo = getVideo;
// GET /videos/:id/comments
const getComments = async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const video = await Video_1.Video.findById(req.params.id).populate('comments.user', 'name');
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    const allComments = [...video.comments].reverse(); // newest first
    const total = allComments.length;
    const paged = allComments.slice(skip, skip + limit);
    const comments = paged.map((c) => ({
        _id: c._id,
        user: c.user._id,
        name: c.user.name,
        text: c.text,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }));
    res.json({ comments, pagination: (0, pagination_1.buildPaginationResult)(total, page, limit) });
};
exports.getComments = getComments;
// POST /videos 🔒 instructor
const createVideo = async (req, res) => {
    const { title, description, videoUrl, thumbnail, duration, visibility, channelId } = req.body;
    if (!title || !videoUrl || !channelId) {
        res.status(400).json({ message: 'title, videoUrl and channelId are required' });
        return;
    }
    const channel = await Channel_1.Channel.findById(channelId);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }
    if (channel.owner.toString() !== req.user.id) {
        res.status(403).json({ message: 'You do not own this channel' });
        return;
    }
    const video = await Video_1.Video.create({
        title,
        description,
        videoUrl,
        thumbnail,
        duration,
        visibility,
        channel: channelId,
        uploader: req.user.id,
    });
    res.status(201).json(video);
};
exports.createVideo = createVideo;
// PATCH /videos/:id 🔒 instructor
const updateVideo = async (req, res) => {
    const video = await Video_1.Video.findById(req.params.id);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    if (video.uploader.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your video' });
        return;
    }
    const { title, description, thumbnail, duration, visibility } = req.body;
    if (title !== undefined)
        video.title = title;
    if (description !== undefined)
        video.description = description;
    if (thumbnail !== undefined)
        video.thumbnail = thumbnail;
    if (duration !== undefined)
        video.duration = duration;
    if (visibility !== undefined)
        video.visibility = visibility;
    await video.save();
    res.json(video);
};
exports.updateVideo = updateVideo;
// DELETE /videos/:id 🔒 instructor
const deleteVideo = async (req, res) => {
    const video = await Video_1.Video.findById(req.params.id);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    if (video.uploader.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your video' });
        return;
    }
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
};
exports.deleteVideo = deleteVideo;
// POST /videos/:id/like 🔒
const toggleLike = async (req, res) => {
    const video = await Video_1.Video.findById(req.params.id);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    const uid = req.user.id;
    const idx = video.likes.findIndex((l) => l.toString() === uid);
    let liked;
    if (idx === -1) {
        video.likes.push(uid);
        liked = true;
    }
    else {
        video.likes.splice(idx, 1);
        liked = false;
    }
    video.likeCount = video.likes.length;
    await video.save();
    res.json({ liked, likeCount: video.likeCount });
};
exports.toggleLike = toggleLike;
// POST /videos/:id/bookmark 🔒
const toggleBookmark = async (req, res) => {
    const video = await Video_1.Video.findById(req.params.id);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    const uid = req.user.id;
    const idx = video.bookmarks.findIndex((b) => b.toString() === uid);
    let bookmarked;
    if (idx === -1) {
        video.bookmarks.push(uid);
        bookmarked = true;
    }
    else {
        video.bookmarks.splice(idx, 1);
        bookmarked = false;
    }
    await video.save();
    res.json({ bookmarked });
};
exports.toggleBookmark = toggleBookmark;
// POST /videos/:id/comments 🔒
const addComment = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ message: 'Comment text is required' });
        return;
    }
    const video = await Video_1.Video.findById(req.params.id);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    video.comments.push({ user: req.user.id, text });
    video.commentCount = video.comments.length;
    await video.save();
    const newComment = video.comments[video.comments.length - 1];
    res.status(201).json({
        _id: newComment._id,
        user: req.user.id,
        text: newComment.text,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
    });
};
exports.addComment = addComment;
//# sourceMappingURL=video.controller.js.map
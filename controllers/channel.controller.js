"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSubscribe = exports.updateChannel = exports.createChannel = exports.getChannel = exports.getMyChannels = exports.getChannels = void 0;
const Channel_1 = require("../models/Channel");
const Video_1 = require("../models/Video");
const Course_1 = require("../models/Course");
const pagination_1 = require("../utils/pagination");
// GET /channels
const getChannels = async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const [channels, total] = await Promise.all([
        Channel_1.Channel.find().select('-subscribers').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Channel_1.Channel.countDocuments(),
    ]);
    res.json({ channels, pagination: (0, pagination_1.buildPaginationResult)(total, page, limit) });
};
exports.getChannels = getChannels;
// GET /channels/mine 🔒 instructor
const getMyChannels = async (req, res) => {
    const channels = await Channel_1.Channel.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(channels);
};
exports.getMyChannels = getMyChannels;
// GET /channels/:id
const getChannel = async (req, res) => {
    const channel = await Channel_1.Channel.findById(req.params.id).select('-subscribers');
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }
    const [videos, courses] = await Promise.all([
        Video_1.Video.find({ channel: channel._id, visibility: 'public' })
            .select('title description videoUrl thumbnail duration visibility views likeCount commentCount channel createdAt updatedAt')
            .populate('channel', 'name icon'),
        Course_1.Course.find({ channel: channel._id })
            .select('title description thumbnail price channel createdAt updatedAt')
            .populate('channel', 'name icon'),
    ]);
    res.json({ ...channel.toObject(), videos, courses });
};
exports.getChannel = getChannel;
// POST /channels 🔒
const createChannel = async (req, res) => {
    const { name, description, icon, poster } = req.body;
    if (!name) {
        res.status(400).json({ message: 'Channel name is required' });
        return;
    }
    const channel = await Channel_1.Channel.create({
        name,
        description,
        icon,
        poster,
        owner: req.user.id,
    });
    res.status(201).json(channel);
};
exports.createChannel = createChannel;
// PATCH /channels/:id 🔒 instructor
const updateChannel = async (req, res) => {
    const channel = await Channel_1.Channel.findById(req.params.id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }
    if (channel.owner.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your channel' });
        return;
    }
    const { name, description, icon, poster } = req.body;
    if (name !== undefined)
        channel.name = name;
    if (description !== undefined)
        channel.description = description;
    if (icon !== undefined)
        channel.icon = icon;
    if (poster !== undefined)
        channel.poster = poster;
    await channel.save();
    res.json(channel);
};
exports.updateChannel = updateChannel;
// POST /channels/:id/subscribe 🔒
const toggleSubscribe = async (req, res) => {
    const channel = await Channel_1.Channel.findById(req.params.id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }
    const userId = req.user.id;
    const idx = channel.subscribers.findIndex((s) => s.toString() === userId);
    let subscribed;
    if (idx === -1) {
        channel.subscribers.push(userId);
        channel.subscriberCount = channel.subscribers.length;
        subscribed = true;
    }
    else {
        channel.subscribers.splice(idx, 1);
        channel.subscriberCount = channel.subscribers.length;
        subscribed = false;
    }
    await channel.save();
    res.json({ subscribed, subscriberCount: channel.subscriberCount });
};
exports.toggleSubscribe = toggleSubscribe;
//# sourceMappingURL=channel.controller.js.map
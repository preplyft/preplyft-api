"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initiatePayment = exports.enrollFree = exports.removeVideoFromCourse = exports.addVideoToCourse = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.getEnrolledCourses = exports.getCourses = void 0;
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const Course_1 = require("../models/Course");
const Channel_1 = require("../models/Channel");
const Video_1 = require("../models/Video");
const Enrollment_1 = require("../models/Enrollment");
const pagination_1 = require("../utils/pagination");
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// GET /courses
const getCourses = async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const [courses, total] = await Promise.all([
        Course_1.Course.find()
            .select('title description thumbnail price channel createdAt updatedAt')
            .populate('channel', 'name icon')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Course_1.Course.countDocuments(),
    ]);
    res.json({ courses, pagination: (0, pagination_1.buildPaginationResult)(total, page, limit) });
};
exports.getCourses = getCourses;
// GET /courses/user/enrolled 🔒
const getEnrolledCourses = async (req, res) => {
    const enrollments = await Enrollment_1.Enrollment.find({ user: req.user.id }).populate({
        path: 'course',
        select: 'title description thumbnail price channel',
        populate: { path: 'channel', select: 'name icon' },
    });
    res.json(enrollments);
};
exports.getEnrolledCourses = getEnrolledCourses;
// GET /courses/:id
const getCourse = async (req, res) => {
    const course = await Course_1.Course.findById(req.params.id)
        .populate('channel', 'name icon')
        .populate('videos', 'title thumbnail duration views');
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    const plain = course.toObject();
    if (req.user) {
        const enrollment = await Enrollment_1.Enrollment.findOne({ user: req.user.id, course: course._id });
        plain.isEnrolled = !!enrollment;
    }
    else {
        plain.isEnrolled = false;
    }
    res.json(plain);
};
exports.getCourse = getCourse;
// POST /courses 🔒 instructor
const createCourse = async (req, res) => {
    const { title, description, thumbnail, price, channel: channelId } = req.body;
    if (!title || price === undefined || !channelId) {
        res.status(400).json({ message: 'title, price, and channel are required' });
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
    const course = await Course_1.Course.create({
        title,
        description,
        thumbnail,
        price,
        channel: channelId,
        instructor: req.user.id,
    });
    res.status(201).json(course);
};
exports.createCourse = createCourse;
// PATCH /courses/:id 🔒 instructor
const updateCourse = async (req, res) => {
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    if (course.instructor.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your course' });
        return;
    }
    const { title, description, thumbnail, price } = req.body;
    if (title !== undefined)
        course.title = title;
    if (description !== undefined)
        course.description = description;
    if (thumbnail !== undefined)
        course.thumbnail = thumbnail;
    if (price !== undefined)
        course.price = price;
    await course.save();
    res.json(course);
};
exports.updateCourse = updateCourse;
// DELETE /courses/:id 🔒 instructor
const deleteCourse = async (req, res) => {
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    if (course.instructor.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your course' });
        return;
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
};
exports.deleteCourse = deleteCourse;
// POST /courses/:id/videos 🔒 instructor
const addVideoToCourse = async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        res.status(400).json({ message: 'videoId is required' });
        return;
    }
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    if (course.instructor.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your course' });
        return;
    }
    const video = await Video_1.Video.findById(videoId);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    if (course.videos.some((v) => v.toString() === videoId)) {
        res.status(409).json({ message: 'Video already in course' });
        return;
    }
    course.videos.push(videoId);
    await course.save();
    const updated = await Course_1.Course.findById(course._id).populate('videos', 'title thumbnail duration views');
    res.json(updated);
};
exports.addVideoToCourse = addVideoToCourse;
// DELETE /courses/:id/videos/:videoId 🔒 instructor
const removeVideoFromCourse = async (req, res) => {
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    if (course.instructor.toString() !== req.user.id) {
        res.status(403).json({ message: 'Not your course' });
        return;
    }
    course.videos = course.videos.filter((v) => v.toString() !== req.params.videoId);
    await course.save();
    const updated = await Course_1.Course.findById(course._id).populate('videos', 'title thumbnail duration views');
    res.json(updated);
};
exports.removeVideoFromCourse = removeVideoFromCourse;
// POST /courses/:id/enroll 🔒 (free courses)
const enrollFree = async (req, res) => {
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    if (course.price > 0) {
        res.status(400).json({ message: 'This is a paid course. Use /enroll/pay instead.' });
        return;
    }
    const existing = await Enrollment_1.Enrollment.findOne({ user: req.user.id, course: course._id });
    if (existing) {
        res.status(409).json({ message: 'Already enrolled' });
        return;
    }
    const enrollment = await Enrollment_1.Enrollment.create({
        user: req.user.id,
        course: course._id,
        status: 'free',
        amountPaid: 0,
        paymentId: null,
        orderId: null,
    });
    res.status(201).json(enrollment);
};
exports.enrollFree = enrollFree;
// POST /courses/:id/enroll/pay 🔒 (paid courses)
const initiatePayment = async (req, res) => {
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    if (course.price === 0) {
        res.status(400).json({ message: 'This is a free course. Use /enroll instead.' });
        return;
    }
    const existing = await Enrollment_1.Enrollment.findOne({ user: req.user.id, course: course._id });
    if (existing) {
        res.status(409).json({ message: 'Already enrolled' });
        return;
    }
    const order = await razorpay.orders.create({
        amount: course.price * 100, // paise
        currency: 'INR',
        receipt: `receipt_${course._id}_${req.user.id}`,
    });
    res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    });
};
exports.initiatePayment = initiatePayment;
// POST /courses/:id/enroll/verify 🔒
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ message: 'Missing payment fields' });
        return;
    }
    const expectedSig = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    if (expectedSig !== razorpay_signature) {
        res.status(400).json({ message: 'Payment verification failed' });
        return;
    }
    const course = await Course_1.Course.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    const enrollment = await Enrollment_1.Enrollment.create({
        user: req.user.id,
        course: course._id,
        status: 'paid',
        amountPaid: course.price,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
    });
    res.status(201).json(enrollment);
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=course.controller.js.map
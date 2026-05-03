"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', course_controller_1.getCourses);
router.get('/user/enrolled', auth_1.authenticate, course_controller_1.getEnrolledCourses);
router.get('/:id', auth_1.optionalAuth, course_controller_1.getCourse);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('instructor'), course_controller_1.createCourse);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('instructor'), course_controller_1.updateCourse);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('instructor'), course_controller_1.deleteCourse);
router.post('/:id/videos', auth_1.authenticate, (0, auth_1.authorize)('instructor'), course_controller_1.addVideoToCourse);
router.delete('/:id/videos/:videoId', auth_1.authenticate, (0, auth_1.authorize)('instructor'), course_controller_1.removeVideoFromCourse);
router.post('/:id/enroll', auth_1.authenticate, course_controller_1.enrollFree);
router.post('/:id/enroll/pay', auth_1.authenticate, course_controller_1.initiatePayment);
router.post('/:id/enroll/verify', auth_1.authenticate, course_controller_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=course.routes.js.map
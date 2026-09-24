const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getCourseEnrollments,
  completePujaBooking,
  getAttendance,
  getMyCourses,
  getMyFreeClasses,
  getMyPujaBookings,
  getUpcomingSchedule,
  markAttendance,
} = require("../controllers/teachercontroller");

const router = express.Router();

router.use(protect, authorize("teacher"));

router.get("/courses", getMyCourses);
router.get("/courses/:id/enrollments", getCourseEnrollments);
router.post("/courses/:id/attendance", markAttendance);
router.get("/courses/:id/attendance", getAttendance);

router.get("/free-classes", getMyFreeClasses);

router.get("/specific-puja/bookings", getMyPujaBookings);
router.patch("/specific-puja/bookings/:id/complete", completePujaBooking);

router.get("/schedule/upcoming", getUpcomingSchedule);

module.exports = router;

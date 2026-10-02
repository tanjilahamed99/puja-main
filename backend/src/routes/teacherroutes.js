const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getMyCourses,
  completePujaBooking,
  getAttendance,
  getCourseEnrollments,
  getMyFreeClasses,
  getMyPujaBookings,
  getUpcomingSchedule,
  markAttendance,
  endFreeClassSession,
  startFreeClassSession,
  getCourseLiveKitToken,
} = require("../controllers/teachercontroller");

const router = express.Router();

router.use(protect, authorize("teacher"));

router.get("/courses", getMyCourses);
router.get("/courses/:id/enrollments", getCourseEnrollments);
router.post("/courses/:id/attendance", markAttendance);
router.get("/courses/:id/attendance", getAttendance);

router.get("/free-classes", getMyFreeClasses);
router.post("/free-classes/:id/start", startFreeClassSession);
router.post("/free-classes/:id/end", endFreeClassSession);

router.get("/specific-puja/bookings", getMyPujaBookings);
router.patch("/specific-puja/bookings/:id/complete", completePujaBooking);

router.get("/schedule/upcoming", getUpcomingSchedule);

router.get("/courses/:id/livekit-token", getCourseLiveKitToken);

module.exports = router;

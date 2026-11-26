const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getMyCourses,
  completePujaBooking,
  getAttendance,
  getCourseEnrollments,
  getMyFreeClasses,
  getUpcomingSchedule,
  markAttendance,
  endFreeClassSession,
  startFreeClassSession,
  getCourseLiveKitToken,
  getMyPujaBooking,
  getPujaBookingLiveKitToken,
  startPujaBooking,
  getMyPujaBookings,
  getMyPujaPackages,
  confirmPujaBooking, // ← new
  reschedulePujaBooking, // ← new
  cancelPujaBooking, // ← new
} = require("../controllers/teachercontroller");

const router = express.Router();

router.use(protect, authorize("teacher"));

router.get("/courses", getMyCourses);
router.get("/courses/:id/enrollments", getCourseEnrollments);
router.post("/courses/:id/attendance", markAttendance);
router.get("/courses/:id/attendance", getAttendance);
router.get("/courses/:id/livekit-token", getCourseLiveKitToken);

router.get("/free-classes", getMyFreeClasses);
router.post("/free-classes/:id/start", startFreeClassSession);
router.post("/free-classes/:id/end", endFreeClassSession);

// Specific puja — list, packages
router.get("/specific-puja/bookings", getMyPujaBookings);
router.get("/specific-puja/packages", getMyPujaPackages);

// Specific puja — single booking
router.get("/specific-puja/bookings/:id", getMyPujaBooking);

// Specific puja — actions
router.patch("/specific-puja/bookings/:id/confirm", confirmPujaBooking); // ← new
router.patch("/specific-puja/bookings/:id/reschedule", reschedulePujaBooking); // ← new
router.patch("/specific-puja/bookings/:id/cancel", cancelPujaBooking); // ← new
router.patch("/specific-puja/bookings/:id/complete", completePujaBooking);
router.post("/specific-puja/bookings/:id/start", startPujaBooking);

// Specific puja — live session
router.get(
  "/specific-puja/bookings/:id/livekit-token",
  getPujaBookingLiveKitToken,
);

router.get("/schedule/upcoming", getUpcomingSchedule);

module.exports = router;

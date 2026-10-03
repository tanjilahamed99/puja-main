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


// LIST (plural)
router.get("/specific-puja/bookings", getMyPujaBookings);

// DETAIL (singular)
router.get("/specific-puja/bookings/:id", getMyPujaBooking);

// TOKEN
router.get(
  "/specific-puja/bookings/:id/livekit-token",
  getPujaBookingLiveKitToken,
);

// START
router.post("/specific-puja/bookings/:id/start", startPujaBooking);

// COMPLETE
router.patch("/specific-puja/bookings/:id/complete", completePujaBooking);

router.get("/schedule/upcoming", getUpcomingSchedule);

router.get("/courses/:id/livekit-token", getCourseLiveKitToken);

module.exports = router;

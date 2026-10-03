const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  enrollInCourse,
  bookPujaPackage,
  browseCourses,
  browseFreeClasses,
  browsePujaPackages,
  donateToFreeClass,
  getMyCertificates,
  getMyEnrollments,
  joinFreeClass,
  getFreeClassLiveKitToken,
  getCourseLiveKitToken,
  getPujaPackageSlots,
  getPujaBookingLiveKitToken,
  getMyPujaBooking,
  getFreeClass,
  getMyCourse
} = require("../controllers/Studentcontroller");

const router = express.Router();

router.use(protect, authorize("student"));

router.get("/enrollments", getMyEnrollments);
router.get("/courses", browseCourses);
router.post("/courses/:id/enroll", enrollInCourse);
router.get("/courses/:id", getMyCourse);
router.get("/courses/:id/livekit-token", getCourseLiveKitToken);

router.get("/free-classes", browseFreeClasses);
router.post("/free-classes/:id/join", joinFreeClass);
router.post("/free-classes/:id/donate", donateToFreeClass);
router.get("/free-classes/:id", getFreeClass);
router.get("/free-classes/:id/livekit-token", getFreeClassLiveKitToken);

router.get("/specific-puja/packages", browsePujaPackages);
router.post("/specific-puja/packages/:id/book", bookPujaPackage);
router.get("/specific-puja/bookings/:id", getMyPujaBooking);
router.get("/specific-puja/packages/:id/slots", getPujaPackageSlots);
router.get(
  "/specific-puja/bookings/:id/livekit-token",
  getPujaBookingLiveKitToken,
);

router.get("/certificates", getMyCertificates);

router.get("/courses/:id/livekit-token", getCourseLiveKitToken);

module.exports = router;

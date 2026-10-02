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
  getMyPujaBookings,
  joinFreeClass,
  getFreeClassLiveKitToken,
  getCourseLiveKitToken,
} = require("../controllers/Studentcontroller");

const router = express.Router();

router.use(protect, authorize("student"));

router.get("/courses", browseCourses);
router.post("/courses/:id/enroll", enrollInCourse);
router.get("/enrollments", getMyEnrollments);

router.get("/free-classes", browseFreeClasses);
router.post("/free-classes/:id/join", joinFreeClass);
router.post("/free-classes/:id/donate", donateToFreeClass);

router.get("/specific-puja/packages", browsePujaPackages);
router.post("/specific-puja/packages/:id/book", bookPujaPackage);
router.get("/specific-puja/bookings", getMyPujaBookings);

router.get("/certificates", getMyCertificates);

router.get("/free-classes/:id/livekit-token", getFreeClassLiveKitToken); // ← add this

router.get("/courses/:id/livekit-token", getCourseLiveKitToken);

module.exports = router;

// routes/adminCourseRoutes.js (or wherever your admin course router lives)
const express = require("express");

const { protect, authorize } = require("../middleware/auth");
const {
  getCourses,
  completeEnrollment,
  createCourse,
  deleteCourse,
  getCourse,
  getCourseEnrollments,
  updateCourse,
} = require("../controllers/courseController");

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/", getCourses);
router.post("/", createCourse);
router.get("/:id", getCourse);
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.get("/:id/enrollments", getCourseEnrollments);
router.patch("/enrollments/:id/complete", completeEnrollment);

module.exports = router;

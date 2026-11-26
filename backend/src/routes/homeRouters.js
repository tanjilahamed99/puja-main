const express = require("express");
const { browseFreeClasses, browseCourses, browsePujaPackages } = require("../controllers/Studentcontroller");

const router = express.Router();

router.get("/free-classes", browseFreeClasses);
router.get("/courses", browseCourses);
router.get("/specific-puja/packages", browsePujaPackages);

module.exports = router;

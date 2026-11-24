const express = require("express");
const {
  getSettings,
  updateSettings,
} = require("../controllers/adminController");
const { authorize, protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/settings/livekit", getSettings);
router.put("/settings/livekit", updateSettings);

module.exports = router;

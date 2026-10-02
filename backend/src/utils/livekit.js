const { AccessToken } = require("livekit-server-sdk");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const asyncHandler = require("./asyncHandler");

// Signs a short-lived LiveKit access token for one user to join one room.
// This runs entirely locally (no network call to LiveKit needed to mint
// the token) — LIVEKIT_API_KEY/LIVEKIT_API_SECRET just need to match
// whatever your LiveKit server (Cloud or self-hosted) was configured with.
async function createLiveKitToken({
  roomName,
  identity,
  name,
  roomAdmin = false,
}) {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity,
      name,
      ttl: "2h",
    },
  );

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin, // true for teachers — lets them mute/remove participants
  });

  return at.toJwt();
}

// studentController.js
exports.getCourseLiveKitToken = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
    status: { $ne: "cancelled" },
  });
  if (!course || !enrollment) {
    res.status(403);
    throw new Error("You are not enrolled in this course");
  }
  if (!isWithinJoinWindow(course.schedule)) {
    // your courseSession.js logic
    res.status(403);
    throw new Error("This class is not open to join yet");
  }
  const token = await createLiveKitToken({
    roomName: course.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
  });
  res.json({
    token,
    roomName: course.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
  });
});

module.exports = { createLiveKitToken };

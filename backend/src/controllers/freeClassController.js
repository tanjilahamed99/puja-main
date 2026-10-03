const asyncHandler = require("../utils/asyncHandler");
const makeRoomId = require("../utils/makeRoomId");
const FreeClass = require("../models/FreeClass");
const FreeClassParticipant = require("../models/FreeClassParticipant");
const Donation = require("../models/Donation");
const { evaluateFreeClassJoinability } = require("../utils/freeClassSession");

// @route GET /api/admin/free-classes
const getFreeClasses = asyncHandler(async (req, res) => {
  const classes = await FreeClass.find()
    .populate("teacher", "name email")
    .sort({ dateTime: -1 });

  const withStats = await Promise.all(
    classes.map(async (fc) => {
      const participantCount = await FreeClassParticipant.countDocuments({
        freeClass: fc._id,
      });
      const donationAgg = await Donation.aggregate([
        { $match: { freeClass: fc._id, status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const j = evaluateFreeClassJoinability(fc);

      return {
        ...fc.toObject(),
        participantCount,
        donationTotal: donationAgg[0]?.total || 0,
        joinability: {
          canJoin: j.canJoin,
          reason: j.reason || null,
          opensAt: j.opensAt,
          closesAt: j.closesAt,
        },
      };
    }),
  );

  res.json({ freeClasses: withStats });
});
// @route GET /api/admin/free-classes/:id
const getFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id).populate(
    "teacher",
    "name email",
  );
  if (!fc) {
    res.status(404);
    throw new Error("Free class not found");
  }
  res.json({ freeClass: fc });
});


// @route POST /api/admin/free-classes
const createFreeClass = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    teacher,
    dateTime,
    image,
    durationMinutes,
    joinLeadMinutes,
    joinGraceMinutes,
  } = req.body;

  if (!title || !dateTime) {
    res.status(400);
    throw new Error("Title and date/time are required");
  }

  const freeClass = await FreeClass.create({
    title,
    description,
    teacher: teacher || undefined,
    dateTime,
    liveKitRoomId: makeRoomId("free"),
    image: image || "",
    durationMinutes: durationMinutes ?? 60,
    joinLeadMinutes: joinLeadMinutes ?? 5,
    joinGraceMinutes: joinGraceMinutes ?? 15,
  });

  res.status(201).json({ freeClass });
});

// @route PATCH /api/admin/free-classes/:id
const updateFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id);
  if (!fc) {
    res.status(404);
    throw new Error("Free class not found");
  }

  [
    "title",
    "description",
    "image",
    "teacher",
    "dateTime",
    "status",
    "durationMinutes",
    "joinLeadMinutes",
    "joinGraceMinutes",
  ].forEach((field) => {
    if (req.body[field] !== undefined) fc[field] = req.body[field];
  });

  // If admin moves the time of a completed/live class back to scheduled,
  // clear lifecycle stamps so the join window recalculates cleanly.
  if (req.body.dateTime && fc.status === "scheduled") {
    fc.startedAt = undefined;
    fc.endedAt = undefined;
  }

  await fc.save();
  res.json({ freeClass: fc });
});

// @route DELETE /api/admin/free-classes/:id
const deleteFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id);
  if (!fc) {
    res.status(404);
    throw new Error("Free class not found");
  }
  await fc.deleteOne();
  res.json({ message: "Free class deleted" });
});

// @route GET /api/admin/free-classes/:id/participants
const getFreeClassParticipants = asyncHandler(async (req, res) => {
  const participants = await FreeClassParticipant.find({
    freeClass: req.params.id,
  }).populate("user", "name email");
  res.json({ participants });
});

// @route GET /api/admin/free-classes/:id/donations
const getFreeClassDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ freeClass: req.params.id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json({ donations });
});

module.exports = {
  getFreeClasses,
  getFreeClass,
  createFreeClass,
  updateFreeClass,
  deleteFreeClass,
  getFreeClassParticipants,
  getFreeClassDonations,
};

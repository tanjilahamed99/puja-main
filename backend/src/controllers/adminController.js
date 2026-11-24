const asyncHandler = require("../utils/asyncHandler");
const Settings = require("../models/Settings");

const getSettings = asyncHandler(async (req, res) => {
  let doc = await Settings.findOne({ key: "livekit" });

  if (!doc) {
    doc = await Settings.create({
      key: "livekit",
      url: process.env.LIVEKIT_URL || "",
      apiKey: process.env.LIVEKIT_API_KEY || "",
      apiSecret: process.env.LIVEKIT_API_SECRET || "",
    });
  }

  // Admin-only route → safe to return the raw secret
  res.status(200).json({
    url: doc.url || "",
    apiKey: doc.apiKey || "",
    apiSecret: doc.apiSecret || "",
  });
});

// @route PUT /api/admin/settings/livekit
// @access Admin
const updateSettings = asyncHandler(async (req, res) => {
  const { url, apiKey, apiSecret } = req.body || {};

  if (!url || !apiKey || !apiSecret) {
    res.status(400);
    throw new Error("Server URL, API Key and API Secret are all required.");
  }

  if (!/^wss?:\/\//i.test(url)) {
    res.status(400);
    throw new Error("Server URL must start with ws:// or wss://");
  }

  let doc = await Settings.findOne({ key: "livekit" });
  if (!doc) doc = new Settings({ key: "livekit" });

  doc.url = url.trim();
  doc.apiKey = apiKey.trim();
  doc.apiSecret = apiSecret.trim();

  await doc.save();

  res.status(200).json({
    url: doc.url,
    apiKey: doc.apiKey,
    apiSecret: doc.apiSecret,
  });
});

module.exports = { getSettings, updateSettings };

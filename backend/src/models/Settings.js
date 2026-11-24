const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "livekit" },
    url: { type: String, default: "" },
    apiKey: { type: String, default: "" },
    apiSecret: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

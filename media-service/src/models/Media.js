const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const mediaSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);
module.exports = Media;

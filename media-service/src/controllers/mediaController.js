const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const mediaUpload = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No files to upload");
      return res.status(400).json({
        success: false,
        message: "No files to upload",
      });
    }
    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;
    logger.info(
      `Uploading file details:{originalName=>${originalname},mimeType=>${mimetype},buffer=>${buffer},user=>${userId}`
    );
    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfully... public_id => ${cloudinaryUploadResult.public_id}`
    );
    const newlyCreatedMedia = new Media({
      userId,
      mimeType: mimetype,
      originalName: originalname,
      url: cloudinaryUploadResult.secure_url,
      publicId: cloudinaryUploadResult.public_id,
    });

    await newlyCreatedMedia.save();
    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload is successfully!..",
    });
  } catch (e) {
    logger.error("Upload error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllMedias = async (req, res) => {
  try {
    const result = await Media.find({});
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    logger.error("Upload error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { mediaUpload, getAllMedias };

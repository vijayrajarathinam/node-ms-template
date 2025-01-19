const cloudinary = require("cloudinary").v2;
const logger = require("./logger");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("error while uploading media to cloudinary");
          reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Media deleted successfully from cloudinary !...");
    return result;
  } catch (e) {
    logger.error("Upload error occured on delete", e);
    res.status(500).json({
      success: false,
      message: "Internal server error on delete",
    });
  }
};
module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };

const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  logger.info("handle Post Deleted", event);
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });
    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(`Deleted media ${media._id} associated with post ${postId}`);
    }
    logger.info(`Processed deletion for post ID ${postId} `);
  } catch (e) {
    logger.error("Error occur while media deletion", e);
  }
};

module.exports = { handlePostDeleted };

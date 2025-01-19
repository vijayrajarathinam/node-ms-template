const Search = require("../models/Search");
const logger = require("../utils/logger");

const searchPost = async (req, res) => {
  logger.info(`Search endpoint hit`);
  try {
    const { query } = req.query;
    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    res.json({ success: true, data: results });
  } catch (e) {
    logger.error("Error while search", e);
    res.status(500).json({ success: false, message: "Error while search" });
  }
};

module.exports = { searchPost };

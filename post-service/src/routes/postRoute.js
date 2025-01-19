const express = require("express");
const {
  getPost,
  createPost,
  getAllPosts,
  deletePost,
} = require("../controllers/postController");
const { authenticateRequest } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authenticateRequest);

router.post("/create", createPost);
router.get("/all", getAllPosts);
router.delete("/:id", deletePost);
router.get("/:id", getPost);

module.exports = router;

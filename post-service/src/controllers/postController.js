const Post = require("../models/Post");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");
const { validateCreatePost } = require("../utils/validation");

const invalidateCache = async (req, input) => {
  const inputKey = `post:${input}`;
  await req.redisClient.del(inputKey);
  const cacheKeys = await req.redisClient.keys(`posts:*`);
  if (cacheKeys.length > 0) await req.redisClient.del(cacheKeys);
};
const createPost = async (req, res) => {
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content, mediaIds } = req.body;
    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    // save in db
    await newPost.save();
    // clear cache
    await invalidateCache(req, newPost._id.toString());
    logger.info("Post created successfully", newPost);
    res
      .status(201)
      .json({ success: true, message: "Post created successfully" });
  } catch (e) {
    logger.error("Error create post", e);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // if redis cached the posts
    const cacheKey = `posts:${page}:${limit}`;
    const cachePosts = await req.redisClient.get(cacheKey);
    if (cachePosts) return res.json(JSON.parse(cachePosts));

    //if redis didnt cache the posts
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const totalNoOfPosts = await Post.countDocuments();
    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.json(result);
  } catch (e) {
    logger.error("Error create post", e);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);
    if (cachedPost)
      return res.json({ success: true, data: JSON.parse(cachedPost) });

    const post = await Post.findById(postId);
    if (!post) {
      logger.warn("Post not found");
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));
    res.json({ success: true, data: post });
  } catch (e) {
    logger.error("Error create post", e);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      logger.warn("Post not found");
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });
    await invalidateCache(req, req.params.id);
    res.json({
      success: true,
      message: "Post deleted successfully!",
    });
  } catch (e) {
    logger.error("Error create post", e);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
};

module.exports = { createPost, getAllPosts, getPost, deletePost };

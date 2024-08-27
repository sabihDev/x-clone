import express from "express";

import { createPost, deletePost, likeUnlikepost, commentPost, getAllPosts, getLikedPosts, getFollowiingPosts } from "../controllers/post.controllers.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowiingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/like/:id", protectRoute, likeUnlikepost);
router.post("/comment/:id", protectRoute, commentPost);

export default router;
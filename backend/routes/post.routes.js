import express from "express";

import { createPost, deletePost, likepost, commentPost } from "../controllers/post.controllers.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.post("/like/:id", protectRoute, likepost);
router.post("/comment/:id", protectRoute, commentPost);

export default router;
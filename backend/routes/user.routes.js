import express from "express";
import { getSuggestedUsers, getUserProfile, followOrUnfollowUser } from "../controllers/user.controllers.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followOrUnfollowUser);
// router.post("/update", protectRoute, updateUserProfile);

export default router
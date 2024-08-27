import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(!text && !img){
            return res.status(400).json({ message: "Please add text or image" });
        }

        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newPost = new User({
            user:userId,
            text,
            img,
        });

        await newPost.save();
        res.status(201).json({ newPost });
    } catch (error) {
        console.log("Error in createPost controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: "Unauthorized" });
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in deletePost controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });        
    }
};

export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({ message: "Please add text" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = { text, user: userId };

        post.comments.push(comment);
        
        await post.save();
        res.status(200).json({ post });
    } catch (error) {
        console.log("Error in commentPost controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
        
    }
};

export const likeUnlikepost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id:postId },{ $pull: { likes: userId } });
            await User.updateOne({ _id:userId },{ $pull: { likedPosts: postId } });
            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            post.likes.push(userId);
            await User.updateOne({ _id:userId },{ $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
                post: postId,
            });
            await notification.save();
            res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (error) {
        console.log("Error in likeUnlikepost controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });        
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({ path: "comments.user", select: "-password" });

        if(posts.length === 0){
            return res.status(404).json([]);
        }

        res.status(200).json({ posts });
    } catch (error) {
        console.log("Error in getAllPosts controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });        
    }
};

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password",
        }).populate({ path: "comments.user", select: "-password" });
        res.status(200).json({ likedPosts });
    } catch (error) {
        console.log("Error in getLikedPosts controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });        
    }
};
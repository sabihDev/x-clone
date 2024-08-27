import User from "../models/user.model.js";
import Post from "../models/post.model.js";
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
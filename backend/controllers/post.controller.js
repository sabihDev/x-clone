import User from "../models/user.model.js";
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
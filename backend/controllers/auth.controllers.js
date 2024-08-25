import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ message: 'Invalid email address' });
        }

        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingEmail = await User.findOne({ email });
        if(existingEmail){
            return res.status(400).json({ message: 'Email already exists' });
        }

        if(password.length < 6){
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ fullName, username, email, password: hashedPassword });
        
        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            return res.status(200).json({ 
                _id : newUser._id,
                fullName : newUser.fullName,
                username : newUser.username,
                email : newUser.email,
                profileImage : newUser.profileImage,
                coverImage : newUser.coverImage,
                followers : newUser.followers,
                following : newUser.following
            });
        } else{
            return res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        
        return res.status(500).json({ error:"Internal Server Error" });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isMatch = await bcrypt.compare(password, user?.password || "");

        if(!user || !isMatch){
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        generateTokenAndSetCookie(user._id, res);

        return res.status(200).json({ 
            _id : user._id,
            fullName : user.fullName,
            username : user.username,
            email : user.email,
            profileImage : user.profileImage,
            coverImage : user.coverImage,
            followers : user.followers,
            following : user.following
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        
        return res.status(500).json({ error:"Internal Server Error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.log("Error in login controller", error.message);
        
        return res.status(500).json({ error:"Internal Server Error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({ user });
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        
        return res.status(500).json({ error:"Internal Server Error" });
    }
}
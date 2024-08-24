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
    console.log('Login controller');
}

export const logout = async (req, res) => {
    console.log('Logout controller');
}
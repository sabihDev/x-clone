import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
    try {
        const {username}=req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" }).select("-password");
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.log("Error in getUserProfile controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


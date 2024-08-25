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

export const followOrUnfollow = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const user = await User.findById(id);
        const me = await User.findById(userId);
        if (!user && !me) {
            return res.status(404).json({ message: "User not found" });
        }

        if(id === userId){
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        // check if already followed
        const isFollowing = me.following.includes(id);
        if (isFollowing) {
            await user.updateOne({ $pull: { followers: userId } });
            await me.updateOne({ $pull: { following: id } });
        } else {
            await user.updateOne({ $push: { followers: userId } });
            await me.updateOne({ $push: { following: id } });
        }
        return res.status(200).json({ message: "Followed or Unfollowed" });
    } catch (error) {
        console.log("Error in followOrUnfollow controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
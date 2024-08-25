import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

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

export const followOrUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const user = await User.findById(id);
        const me = await User.findById(userId);
        if (!user && !me.toString()) {
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
            return res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            await user.updateOne({ $push: { followers: userId } });
            await me.updateOne({ $push: { following: id } });

            // send notification
            const notification = new Notification({
                from: userId,
                to: id,
                type: "follow",
            });
            await notification.save();

            return res.status(200).json({ message: "Followed successfully" });
        }
        
    } catch (error) {
        console.log("Error in followOrUnfollow controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            {$sample: { size: 10 }},
        ]);

        const filteredUsers = users.filter((user) => {
            return !usersFollowedByMe.following.includes(user._id);
        });

        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => {
            user.password =null;
        });

        return res.status(200).json({ users: suggestedUsers });
    } catch (error) {
        console.log("Error in getSuggestedUsers controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
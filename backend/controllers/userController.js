import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import { mongoose } from "mongoose";


const signupUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User({
            name,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);

    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};


const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in logoutUser: ", err.message);
    }
}

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id); // user we want to follow/unfollow
        const currentUser = await User.findById(req.user._id); // user who is following/unfollowing
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // unfollow user
            // Modify current user following , modify followers of userToModify
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // follow user
            // Modify current user following , modify followers of userToModify
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in followUnfollowUser: ", err.message);

    }
}

const updateUser = async (req, res) => {
    const { name, username, email, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (req.params.id !== userId.toString()) {
            return res.status(400).json({ error: "You cannot update other user's profile" });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.username = username || user.username;
        user.email = email || user.email;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        //password should not be sent to the client
        user.password = null;
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in updateUser: ", err.message);
    }
}

const getUserProfile = async (req, res) => {
    // we fill fetch user profile either with username or id
    // query is either username or id
    const { query } = req.params;
    try {
        let user;

        // check if query is an id
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            // check if query is a username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }

}

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile };
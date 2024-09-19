import User from "../models/userModel.js";
import Post from "../models/postModel.js";

const createPost = async (req, res) => {
    try {
        const { postedBy, text, img } = req.body;

        if (!postedBy || !text) {
            return res.status(400).json({ message: "Posted by and text fields are required" });
        }

        const user = await User.findById(postedBy);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //Check if the user is the same as the one who is logged in
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized to create post for another user" });
        }

        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ message: `Text length should be less than ${maxLength}` });
        }

        const newPost = new Post({ postedBy, text, img });
        await newPost.save();

        res.status(201).json({ message: "Post created successfully", newPost });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);

    }
}

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ post });
    } catch (error) {
        res.status(500).json({ message: error.message });
        log(error);
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        //Check if the user is the same as the one who is logged in

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized to delete post for another user" });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            //Unlike the post
            await Post.findByIdAndUpdate({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            //Like the post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Post liked successfully" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

const replyToPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.name;

        if (!text) {
            return res.status(400).json({ message: "Text field is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const reply = { userId, text, username, userProfilePic };

        post.replies.push(reply);
        await post.save();

        res.status(201).json({ message: "Reply added successfully", post });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

const getFeedPosts=async (req,res) => {
    try {
        const userId = req.user._id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const following=user.following;

        const feedPosts=await Post.find({postedBy:{$in:following}}).sort({createdAt:-1});

        res.status(200).json({feedPosts});
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts };
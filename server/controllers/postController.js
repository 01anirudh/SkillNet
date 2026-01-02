//Add Post
import fs from 'fs'
import imageKit from '../configs/imageKit.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import { toFile } from '@imagekit/nodejs';

export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { content, post_type } = req.body;
        const images = req.files;

        let image_urls = []

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path)
                    const response = await imageKit.files.upload({
                        file: await toFile(fileBuffer, 'file'),
                        fileName: image.originalname,
                        folder: "posts",
                    });


                    const url = imageKit.helper.buildSrc({
                        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                        src: response.filePath,
                        transformation: [
                            {
                                width: 1280,
                                quality: 'auto',
                                format: 'webp',
                            },
                        ],
                    });
                    console.log("ImageKit Post Upload Response:", response);
                    console.log("Using Post Image URL:", response.url);
                    return (response.url);
                })
            )
        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        res.json({ success: true, message: "Post created successfully" });
    } catch (error) {
        console.error("Post Creation Error:", error);
        res.json({ success: false, message: error.message });
    }
}

export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await User.findById(userId);

        //Usr connections and followings
        const userIds = [userId, ...user.connections, ...user.following];
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { postId } = req.body;

        const post = await Post.findById(postId);

        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId);
            await post.save();
            res.json({ success: true, message: 'Post unliked' });
        } else {
            post.likes_count.push(userId);
            await post.save();
            res.json({ success: true, message: 'Post liked' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



import fs from 'fs';
import imageKit from '../configs/imageKit.js';
import { toFile } from '@imagekit/nodejs';
import Story from "../models/story.js";
import User from "../models/user.js";
import { inngest } from "../inngest/index.js";

// Add User Story


export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { content, media_type, background_color } = req.body;
        const media = req.file;

        let media_url = ''

        // upload media to imageKit
        if (media_type == 'image' || media_type == 'video') {
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imageKit.files.upload({
                file: await toFile(fileBuffer, 'file'),
                fileName: media.originalname,
            });

            media_url = imageKit.helper.buildSrc({
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
            console.log("ImageKit Upload Response:", response);
            media_url = response.url;
            console.log("Generated Media URL:", media_url);
        }
        //create Story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        })

        // schedule story deletion after 24 hours
        try {
            await inngest.send({
                name: 'app/story.delete',
                data: { storyId: story._id }
            })
        } catch (inngestError) {
            console.error("Inngest Event Error:", inngestError);
            // Don't fail the request if Inngest fails, just log it.
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Story Creation Error:", error);
        res.json({ success: false, message: error.message });
    }
}

// Get User stories
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await User.findById(userId);

        //User connections and followings
        const userIds = [userId, ...user.connections, ...user.following];

        const stories = await Story.find({
            user: { $in: userIds }
        }).populate('user').sort({ createdAt: -1 });
        res.json({ success: true, stories })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete User Story
export const deleteStory = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { storyId } = req.params;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.json({ success: false, message: 'Story not found' });
        }

        if (story.user.toString() !== userId) {
            return res.json({ success: false, message: 'Not authorized to delete this story' });
        }

        await Story.findByIdAndDelete(storyId);
        res.json({ success: true, message: 'Story deleted successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
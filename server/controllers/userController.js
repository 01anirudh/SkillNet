import imageKit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../models/connections.js";
import Post from "../models/post.js";
import User from "../models/user.js";
import fs from 'fs';
import { toFile } from '@imagekit/nodejs';

// get user Data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        else {
            res.json({ success: true, user });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update User Data

export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth;
        let { username, bio, location, full_name } = req.body;

        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username)

        if (tempUser.username !== username) {
            const user = await User.findOne({ username });
            if (user) {
                // we will not change the username if it is already taken
                username = tempUser.username
            }
        }


        const updatedData = {
            username,
            bio,
            location,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0];
        const cover = req.files.cover && req.files.cover[0];

        if (profile) {
            const fileBuffer = fs.readFileSync(profile.path)
            // const response = imageKit.upload({
            //     file:buffer,
            //     filename:profile.originalname,

            // })
            const response = await imageKit.files.upload({ file: await toFile(fileBuffer, 'file'), fileName: profile.originalname });

            const url = imageKit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                    {
                        width: 512,
                        quality: 'auto',
                        format: 'webp',
                    },
                ],
            });
            updatedData.profile_picture = url;
        }

        if (cover) {
            const fileBuffer = fs.readFileSync(cover.path)
            const response = await imageKit.files.upload({ file: await toFile(fileBuffer, 'file'), fileName: profile.originalname });


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
            updatedData.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        res.json({ success: true, user, message: 'Profile updated succesfully' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Find user using username , email location, name

export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth;

        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    { username: new RegExp(input, 'i') },
                    { email: new RegExp(input, 'i') },
                    { full_name: new RegExp(input, 'i') },
                    { location: new RegExp(input, 'i') },


                ]
            }
        )
        const filteredUsers = allUsers.filter(user => user._id !== userId);

        res.json({ success: true, users: filteredUsers });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Follow User

export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body;

        const user = await User.findById(userId)

        if (user.following.includes(id)) {
            return res.json({ success: false, message: 'You are already following this user' })
        }

        user.following.push(id);

        await user.save();

        const toUser = await User.findById(id)
        toUser.followers.push(userId)

        await toUser.save()

        res.json({ success: true, message: "Now you are following this user" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Unfollow User

export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body;

        const user = await User.findById(userId);

        user.following = user.following.filter(user => user != id);


        await user.save();

        const toUser = await User.findById(id);

        toUser.followers = toUser.followers.filter(user => user != userId);


        await toUser.save();

        res.json({ success: true, message: "You are no longer following this user" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body;

        // Check if user has sent more than 20 connection requests in the last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find({
            from_user_id: userId,
            createdAt: { $gt: last24Hours }
        })
        if (connectionRequests >= 20) {
            return res.json({ success: false, message: 'You have sent more than 20 connection request in the last 24 hours' })
        }

        // Check if users are already connected
        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ]
        })

        if (!connection) {
            const newConnection = await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })

            await inngest.send({
                name: 'app/connection-request',
                data: { connectionId: newConnection._id }
            })

            return res.json({ success: true, message: 'Connection request sent successfully' });
        } else if (connection && connection.status == 'accepted') {
            return res.json({ success: false, message: 'You are already connected with this user' })
        }
        return res.json({ success: false, message: 'Connection request pending' })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await User.findById(userId).populate('connections followers following');

        // Deduplicate connections using Set and Map to ensure unique objects by _id
        const uniqueConnections = Array.from(new Map(user.connections.map(item => [item._id.toString(), item])).values());
        const uniqueFollowing = Array.from(new Map(user.following.map(item => [item._id.toString(), item])).values());
        const uniqueFollowers = Array.from(new Map(user.followers.map(item => [item._id.toString(), item])).values());

        const connections = uniqueConnections.filter(c => c);
        const following = uniqueFollowing.filter(f => f);
        const followers = uniqueFollowers.filter(f => f);

        const pendingConnections = (await Connection.find({ to_user_id: userId, status: 'pending' }).populate('from_user_id')).map((connection) => connection.from_user_id).filter(c => c);
        res.json({ success: true, connections, followers, following, pendingConnections })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body;

        const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId });

        if (!connection) {
            return res.json({ success: false, message: 'Connection not found' });
        }

        const user = await User.findById(userId);

        // Check if already connected before pushing
        if (!user.connections.includes(id)) {
            user.connections.push(id);
            await user.save();
        }

        const toUser = await User.findById(id);

        // Check if already connected before pushing
        if (!toUser.connections.includes(userId)) {
            toUser.connections.push(userId);
            await toUser.save();
        }

        connection.status = 'accepted';
        await connection.save();

        res.json({ success: true, message: 'Connection accepted successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


//Get user Profile
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await User.findById(profileId);
        if (!profile) {
            return res.json({ success: false, message: "Profile not found" });
        }
        const posts = await Post.find({ user: profileId }).populate('user')

        res.json({ success: true, profile, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get Suggested Users
export const getSuggestedUsers = async (req, res) => {
    try {
        const { userId } = req.auth;
        const limit = parseInt(req.query.limit) || 5;

        // Get current user to access their following list
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res.json({ success: false, message: "User not found" });
        }

        // Find users who are NOT the current user AND NOT already followed
        const users = await User.find({
            _id: {
                $ne: userId,
                $nin: currentUser.following
            }
        })
            .limit(limit)
            .select('-password -email'); // Exclude sensitive info

        res.json({ success: true, users });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}   
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const fetchFeedPosts = createAsyncThunk('post/fetchFeed', async (token) => {
    const { data } = await api.get('/api/post/feed', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data.success ? data.posts : [];
});

const postSlice = createSlice({
    name: 'post',
    initialState: {
        feed: [],
        loading: false
    },
    reducers: {
        setFeed: (state, action) => {
            state.feed = action.payload;
        },
        updatePostLikes: (state, action) => {
            const { postId, likes_count } = action.payload;
            const post = state.feed.find(p => p._id === postId);
            if (post) {
                post.likes_count = likes_count;
            }
        },
        toggleLike: (state, action) => {
            const { postId, userId } = action.payload;
            const post = state.feed.find(p => p._id === postId);
            if (post) {
                if (post.likes_count.includes(userId)) {
                    post.likes_count = post.likes_count.filter(id => id !== userId);
                } else {
                    post.likes_count.push(userId);
                }
            }
        },
        removePost: (state, action) => {
            state.feed = state.feed.filter(post => post._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeedPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.feed = action.payload;
            })
            .addCase(fetchFeedPosts.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const { setFeed, updatePostLikes, removePost, toggleLike } = postSlice.actions;
export default postSlice.reducer;

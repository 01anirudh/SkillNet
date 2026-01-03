import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts } from '../features/post/postSlice';
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feed = () => {
  
    const dispatch = useDispatch();
    const { feed: feeds, loading } = useSelector((state) => state.post);
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            const token = await getToken();
            dispatch(fetchFeedPosts(token));
        }
        fetchPosts();
    }, [dispatch]);
  
    return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
        {/* {Stories and post linst} */}
        <div >
            <StoriesBar/>
            <div className='p-4 space-y-6'>
                {feeds.map((post)=>(
                    <PostCard key={post._id} post={post}/>
                ))}
            </div>
        </div>

        {/* {Right side Bar} */}
        <RightSidebar />
        
    </div>
  ) : <Loading/>
}

export default Feed
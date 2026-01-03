import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import moment from 'moment';
import { useAuth } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { fetchUser } from '../features/user/userSlice';
import toast from 'react-hot-toast';

const UserProfileInfo = ({user,posts,profilId,setShowEdit}) => {
    
    const currentUser = useSelector((state)=>state.user.value);
    const {getToken} = useAuth();
    const dispatch = useDispatch();
    const [isFollowing,setIsFollowing] = useState(false);

    const handleFollow = async () => {
        try {
            const token = await getToken();
            const endpoint = isFollowing ? '/api/user/unfollow' : '/api/user/follow';
            const { data } = await api.post(endpoint, { id: user._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setIsFollowing(!isFollowing);
                // Update Redux state to reflect new following list
                dispatch(fetchUser(token));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (currentUser && user) {
            setIsFollowing(currentUser.following.includes(user._id));
        }
    }, [currentUser, user]);
  return (
    <div className='relative py-4 px-6 md:px-8 bg-white'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
            <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full overflow-hidden'>
                <img src={user.profile_picture} alt={user.full_name}  className='w-full h-full object-cover'/>
            </div>
            <div className='w-full pt-16 md:pt-0 md:pl-36'>
                <div className='flex flex-col md:flex-row items-start justify-between'>
                    <div>
                        <div className='flex items-center gap-3'>
                            <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                            <Verified className='w-6 h-6 text-blue-500'/>
                        </div>
                        <p className='text-gray-600'>{user.username ? `@${user.username}` : 'Add a username'}</p>
                    </div>
                    {/* if user is not on profile that means he is opening his profile so we will give edit button */}
                    {
                        !profilId || currentUser._id === user._id ?  (
                        <button onClick={()=> setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2
                        rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer'>
                            <PenBox className='w-4 h-4'/> Edit
                        </button>
                        ): (
                            <button onClick={handleFollow} className={`flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-full font-medium transition-colors mt-4 md:mt-0 cursor-pointer hover:shadow-md 
                            ${isFollowing ? 'bg-gray-100 text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800 border-transparent'}`}>
                             {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        )
                    }
                </div>
                <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>

                <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                    <span className='flex items-center gap-1.5'>
                        <MapPin className='w-4 h-4'/>
                        {user.location ? user.location:'Add location'}
                    </span>
                    <span className='flex items-center gap-1.5'>
                        <Calendar className='w-4 h-4'/>
                        Joined <span className='font-medium'>{moment(user.createdAt).fromNow()}</span>
                    </span>
                </div>
                    
                <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
                    </div>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{user.followers.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
                    </div>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{user.following.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  )
}

export default UserProfileInfo
import { BadgeCheck, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react'
import  moment  from 'moment';
import { useState, useEffect } from 'react';
import { dummyUserData } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLike } from '../features/post/postSlice';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({post}) => {

    const postWithHashtags = post.content.replace(/(#\w+)/g,'<span class="text-indigo-600">$1</span>');
    const likes = post.likes_count;
    const currentUser = useSelector((state)=>state.user.value);
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const location = useLocation();
    const {getToken} = useAuth();

    const handleLike = async () => {
        try{
            // Optimistic Update
            dispatch(toggleLike({ postId: post._id, userId: currentUser._id }));

            const {data} = await api.post(`/api/post/like`,{postId:post._id},
                {headers:{Authorization:`Bearer ${await getToken()}`}}
            )
            if(data.success){
                // toast.success(data.message);
                // No need to update state here, Redux/SSE handles it
            }
            else {
                toast.error(data.message)
                // Revert on failure
                dispatch(toggleLike({ postId: post._id, userId: currentUser._id }));
            }
        }catch(error){
            toast.error(error.message);
            // Revert on error
            dispatch(toggleLike({ postId: post._id, userId: currentUser._id }));
        }   
    }

    const handleDelete = async () => {
        try {
            if (confirm("Are you sure you want to delete this post?")) {
                 const { data } = await api.delete(`/api/post/delete/${post._id}`, {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });
                if (data.success) {
                    toast.success(data.message);
                     window.location.reload();
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-4 w-full max-w-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
        <div className='flex items-center justify-between'>
            <div onClick={()=>navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer group'>
                <img src={post.user.profile_picture} alt=""  className='w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition'/>
                <div>
                    <div className='flex items-center space-x-1.5'>
                        <span className='font-semibold text-slate-900 group-hover:text-blue-700 transition'>{post.user.full_name}</span>
                        <BadgeCheck className='w-4 h-4 text-sky-600'/>
                    </div>
                    <div className='text-slate-500 text-xs'>@{post.user.username} • {moment(post.createdAt).fromNow()}</div>
                </div>
            </div>
            {currentUser._id === post.user._id && location.pathname.includes('/profile') && (
                <Trash2 onClick={handleDelete} className='w-5 h-5 text-slate-400 hover:text-red-500 cursor-pointer transition' />
            )}
        </div>

        {/* Content */}
         {post.content && <div className='text-slate-800 text-[15px] leading-relaxed whitespace-pre-line' dangerouslySetInnerHTML={{__html:postWithHashtags}}/>}

        {/* Images */}

        <div className='grid grid-cols-2 gap-2 overflow-hidden rounded-lg'>
            {post.image_urls.map((img,index)=>(
                <img src={img} key={index} className={`w-full rounded-lg hover:scale-[1.01] transition duration-300 cursor-pointer ${post.image_urls.length === 1 ? 'col-span-2 h-auto' : 'h-80 object-cover'}`}
                alt=""/>
            ))}
            </div>    


            {/* Actions */}

            <div className='flex items-center justify-between text-slate-500 text-sm pt-4 border-t border-slate-100 mt-2'>
                <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2 group cursor-pointer' onClick={handleLike}>
                        <Heart className={`w-5 h-5 transition-transform group-active:scale-125 ${likes.includes(currentUser._id) ? 'text-red-500 fill-red-500' : 'text-slate-500 group-hover:text-red-500'}`} />
                        <span className={`font-medium ${likes.includes(currentUser._id) ? 'text-red-500' : 'group-hover:text-red-500'}`}>{likes.length}</span>
                    </div>
            
                    {/* <div className='flex items-center gap-2 group cursor-pointer'>
                        <MessageCircle className='w-5 h-5 text-slate-500 group-hover:text-blue-600 transition' />
                        <span className='font-medium group-hover:text-blue-600 transition'>{12}</span>
                    </div>
                
                    <div className='flex items-center gap-2 group cursor-pointer'>
                        <Share2 className='w-5 h-5 text-slate-500 group-hover:text-green-600 transition' />
                        <span className='font-medium group-hover:text-green-600 transition'>{7}</span>
                    </div> */}
                </div>
            </div>
           

    </div>
  )
}

export default PostCard
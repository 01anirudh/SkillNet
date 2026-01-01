import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RightSidebar = () => {

    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const fetchSuggestedUsers = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/user/suggested?limit=5', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setSuggestedUsers(data.users);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleFollow = async (userId) => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/follow', { id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Following user');
                // Remove user from the list
                setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        fetchSuggestedUsers();
    }, []);

    return (
        <div className='hidden xl:block max-w-xs sticky top-24'>
            <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-4'>
                <h3 className='font-semibold text-slate-800 mb-4'>Who to follow</h3>
                <div className='flex flex-col gap-4'>
                    {suggestedUsers.length > 0 ? (
                        suggestedUsers.map((user) => (
                        <div key={user._id} className='flex items-center gap-3 group cursor-pointer'>
                            <img 
                                onClick={() => navigate(`/profile/${user._id}`)}
                                src={user.profile_picture} 
                                alt="" 
                                className='w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition'
                            />
                            <div className='flex-1 min-w-0' onClick={() => navigate(`/profile/${user._id}`)}>
                                <p className='font-medium text-slate-900 truncate group-hover:text-blue-700 transition'>{user.full_name}</p>
                                <p className='text-xs text-slate-500 truncate'>@{user.username}</p>
                            </div>
                            <button onClick={() => handleFollow(user._id)} className='p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition active:scale-95'>
                                <UserPlus className='w-4 h-4' />
                            </button>
                        </div>
                    ))) : (
                        <p className='text-sm text-slate-500'>No suggestions available.</p>
                    )}
                </div>
                <button onClick={() => navigate('/discover')} className='w-full mt-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition'>
                    Show more
                </button>
            </div>

            <div className='mt-4 text-xs text-slate-400 px-2'>
                <p>© 2025 SkillNet Corporation.</p>
            </div>
        </div>
    );
};

export default RightSidebar;

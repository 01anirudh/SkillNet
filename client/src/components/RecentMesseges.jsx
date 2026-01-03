import React, { useEffect, useState } from 'react'
import { dummyRecentMessagesData } from '../assets/assets';
import { Link, useNavigate } from 'react-router';
import moment from 'moment';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const RecentMesseges = () => {
  
    const [messages,setMessages] = useState([]);
    const navigate = useNavigate();
    const {user} = useUser();
    const {getToken} = useAuth();

    const fetchRecentMessages = async () => {
        try {
            const token = await getToken();

            const {data} = await api.get('/api/user/recent-messages',{
                headers:{Authorization:`Bearer ${token}`}

           })
           if(data.success){
            // Group messages by sender and get the latest message form each sender
            const groupedMessage = data.messages.reduce((acc,message)=>{
                const senderId = message.from_user_id._id;
                if(!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)){
                    acc[senderId] = message
                }
                return acc;
            },{})

            //Sort messages by date
            const sortedMessages = Object.values(groupedMessage).sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setMessages(sortedMessages)
           }
           else{
            toast.error(data.message)
           }
        } catch (error) {
            toast.error(error.message)      
        }
    }

    useEffect(()=>{
        if(user){
            fetchRecentMessages();
            const intervalId = setInterval(fetchRecentMessages,30000);
            return () => clearInterval(intervalId);
        }
    },[user])

    return (
    <div className='bg-white max-w-xs mt-6 p-5 rounded-lg shadow-sm border border-slate-200 text-sm'>
        <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
        <div className='flex flex-col max-h-64 overflow-y-auto custom-scrollbar pr-1'>
            {
                messages.map((message,index)=>(
                    <Link to={`/message/${message.from_user_id._id}`} key={index} className='flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors group'>
                        <img 
                            onClick={(e)=>{
                                e.preventDefault();
                                navigate('/profile/'+message.from_user_id._id)
                            }}
                            src={message.from_user_id.profile_picture} alt="" className='w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition' 
                        />
                        <div className='flex-1 min-w-0'>
                            <div className='flex justify-between items-baseline mb-0.5'>
                                <p className='font-medium text-slate-900 truncate'>{message.from_user_id.full_name}</p>
                                <p className='text-xs text-slate-400 whitespace-nowrap ml-2'>{moment(message.createdAt).fromNow(true)}</p>
                            </div>
                            <div className='flex justify-between items-center'>
                                <p className='text-xs text-slate-500 truncate pr-2'>{message.text ? message.text : '📷 Sent an image'}</p>
                                {!message.seen && <span className='bg-blue-600 text-white min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] px-1 shadow-sm shadow-blue-200'>1</span>}
                            </div>
                        </div>
                    </Link>
                ))
            }
        </div>

    </div>
  )
}

export default RecentMesseges
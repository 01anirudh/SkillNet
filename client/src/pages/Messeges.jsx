import React from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

const Messeges = () => {

    const {connections} = useSelector((state)=>state.connections);

    const navigate = useNavigate();

  return (
    <div className='min-h-screen relative bg-slate-50'>
        <div className='max-w-6xl mx-auto p-6'>
            {/* Title */}
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
                <p className='text-slate-600'>Talk to your Connections</p>
            </div>
            {/* Connected Users */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {connections.map((user)=>(
                    <div key={user._id} className='flex gap-4 p-5 bg-white shadow-sm border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300 group'>
                        <img src={user.profile_picture} alt="" className='rounded-full w-12 h-12 object-cover ring-2 ring-slate-50 group-hover:ring-blue-100 transition' />
                        <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-slate-800 truncate'>{user.full_name}</p>
                            <p className='text-slate-500 text-sm truncate'>@{user.username}</p>
                            <p className='text-sm text-slate-400 mt-1 line-clamp-1'>{user.bio || "No bio available"}</p>
                            
                            <div className='flex gap-2 mt-4'>
                                <button onClick={()=>navigate(`/message/${user._id}`)} className='flex-1 py-2 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800
                                active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-blue-100'>
                                   <MessageSquare className='w-4 h-4' />
                                   Message
                                </button>

                                <button onClick={()=>navigate(`/profile/${user._id}`)} className='px-3 py-2 text-sm rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-700
                                active:scale-95 transition cursor-pointer border border-slate-200'>
                                   <Eye className='w-4 h-4' />
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default Messeges
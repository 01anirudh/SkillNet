import {Users,UserPlus,UserCheck,UserRoundPen,MessageSquare} from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector,useDispatch } from 'react-redux';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { fetchConnections } from '../features/connections/connectionSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
const Connections = () => {

    const navigate = useNavigate();

    const {getToken} = useAuth();

    const dispatch = useDispatch();

    const {connections,pendingConnections,followers,following} = useSelector((state)=>state.connections)

    const [currentTab,setCurrentTab] = useState('Followers')

    const dataArray = [
        {label:'Followers',value:followers, icon:Users},
        {label:'Following',value:following, icon:UserCheck},
        {label:'Pending',value:pendingConnections, icon:UserRoundPen},
        {label:'Connections',value:connections, icon:UserPlus}
    ]

    const handleUnfollow = async (userId) =>{
        try{
            const {data} = await api.post('/api/user/unfollow',{id:userId},{
                headers:{Authorization:`Bearer ${await getToken()}`}
            })
            if(data.success){
                toast.success(data.message);
                dispatch(fetchConnections(await getToken()))
            }else    toast(data.message)
        }catch(error){
            toast.error(error.message);
        }
    }

    const acceptConnection = async (userId) =>{
        try{
            const {data} = await api.post('/api/user/accept',{id:userId},{
                headers:{Authorization:`Bearer ${await getToken()}`}
            })
            if(data.success){
                toast.success(data.message);
                dispatch(fetchConnections(await getToken()))
            }else   toast(data.message)
        }catch(error){
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        getToken().then((token)=>{
            dispatch(fetchConnections(token));
        })
    },[])

  return (
    <div className='min-h-screen bg-slate-50'>
        <div className='max-w-6xl mx-auto p-6'>

            {/* Title */}
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-slate-800 mb-2'>Connections</h1>
                <p className='text-slate-500'>Manage your network and discover new connections</p>
            </div>

            {/* Counts */}
            <div className='mb-8 flex flex-wrap gap-6'>
            {
                dataArray.map((item,index)=>(
                    <div key={index} className='flex flex-col items-center justify-center gap-1 border border-slate-200 bg-white h-24 w-40
                    shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300'>
                    <b className='text-2xl text-slate-800'>{item.value.length}</b>
                    <p className='text-slate-500 text-sm font-medium flex items-center gap-2'>
                        <item.icon className="w-4 h-4 text-blue-600" />
                        {item.label}
                    </p>
                    </div>
                ))
            }
            </div>
            
            {/* Tabs */}
            
            <div className='inline-flex flex-wrap items-center border border-slate-200 rounded-lg p-1 bg-white shadow-sm'>
            {
                dataArray.map((tab)=>(
                    <button onClick={()=>setCurrentTab(tab.label)} key={tab.label} className={`flex items-center px-4 py-2 text-sm 
                        cursor-pointer rounded-md transition-all duration-200
                    ${currentTab === tab.label ? 'bg-slate-100 font-semibold text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        <tab.icon className={`w-4 h-4 ${currentTab === tab.label ? 'text-blue-600' : 'text-slate-400'}`}/>
                        <span className='ml-2'>{tab.label}</span>
                        {
                            tab.count !== undefined && (
                                <span className='ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full'>{tab.count}</span>
                            )
                        }
                    </button>
                ))
            }
            </div>
            {/* Connections */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
                {
                    dataArray.find((item)=>item.label === currentTab).value?.filter(user => user).map((user)=>(
                        <div key={user._id} className='w-full flex gap-4 p-5 bg-white shadow-sm border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300'>
                            <img src={user?.profile_picture} alt="" className='rounded-full w-14 h-14 object-cover ring-2 ring-slate-50 shadow-sm'/>
                            <div className='flex-1 min-w-0'>
                                <p className='font-semibold text-slate-900 truncate'>{user?.full_name}</p>
                                <p className='text-slate-500 text-sm truncate'>@{user?.username}</p>
                                <p className='text-slate-500 text-sm mt-1 line-clamp-2 min-h-[2.5rem]'>{user?.bio || "No bio available"}</p>
                                <div className='flex max-sm:flex-col gap-2 mt-4'>
                                    {
                                        <button onClick={()=>navigate(`/profile/${user._id}`)} className='flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100
                                        active:scale-95 transition cursor-pointer border border-blue-100'>
                                            Profile
                                        </button>
                                    }
                                    {
                                        currentTab === 'Following' && (
                                            <button onClick={()=>handleUnfollow(user._id)} className='flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-500 active:scale-95
                                            transition cursor-pointer'>
                                                Unfollow
                                            </button>
                                        )
                                    }
                                    {
                                        currentTab === 'Pending' && (
                                            <button onClick={()=>acceptConnection(user._id)} className='flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 active:scale-95
                                            transition cursor-pointer shadow-sm shadow-blue-200'>
                                                Accept
                                            </button>
                                        )
                                    }
                                    {
                                        currentTab === 'Connections' && (
                                            <button onClick={()=>navigate(`/message/${user._id}`)} className='flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 active:scale-95
                                            transition cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-blue-200'>
                                               <MessageSquare className='w-4 h-4'/>
                                                Message
                                            </button>
                                        )
                                    }
                                </div>
                            </div>

                        </div>
                    ))
                }
            </div>
        </div>

    </div>
  )
}

export default Connections
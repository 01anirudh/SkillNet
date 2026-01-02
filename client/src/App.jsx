import React, { useRef } from 'react'
import { Route,Routes, useLocation } from 'react-router-dom'
import Feed from './pages/Feed'
import LogIn from './pages/LogIn'
import Messeges from './pages/Messeges'
import ChatBox from './pages/ChatBox'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useUser,useAuth } from '@clerk/clerk-react'
import Layout  from './pages/Layout'
import Connections from './pages/Connections'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionSlice'
import { addMessage } from './features/messages/meesagesSlice'
import Notification from './components/Notification'
import Loading from './components/Loading'

const App = () => {
  const {user, isLoaded} = useUser();
  const {getToken} = useAuth();
  const {pathname} = useLocation()
  const pathnameRef = useRef(pathname)

  const dispatch = useDispatch();

  useEffect(()=>{
    const fetchData = async () =>{
      if(user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData();
  },[user,getToken,dispatch]);

  useEffect(()=>{
    pathnameRef.current = pathname;
  },[pathname])

  useEffect(()=>{
    if(user){
      const baseUrl = import.meta.env.VITE_BASEURL.replace(/\/$/, '');
      const eventSource =new EventSource(baseUrl + '/api/message/' + user.id);

      eventSource.onmessage = (event) =>{
        const message = JSON.parse(event.data)
        
        if(pathnameRef.current === ('/message/' + message.from_user_id._id)){
          dispatch(addMessage(message))
        }
        else{
          toast.custom((t)=>(
            <Notification t={t} message={message}/>
          ),{position:'bottom-right'})
        }
      }
      return ()=>{
        eventSource.close();
      }
      
    }
  },[user,dispatch])

  if (!isLoaded) {
    return <Loading />
  }

  return (
    <>
    <Toaster/>
    <Routes>
      <Route path = '/' element = {!user ? <LogIn/>:<Layout/>}>
        <Route index element = {<Feed/>}/>
        <Route path='message' element={<Messeges/>}/>
        <Route path='message/:userId' element={<ChatBox/>}/>
        <Route path='connections' element={<Connections/>}/>
        <Route path='discover' element={<Discover/>}/>
        <Route path='profile' element={<Profile/>}/>
        <Route path='profile/:profileId' element={<Profile/>}/>
        <Route path='create-post' element={<CreatePost/>}/>
      </Route>
    </Routes>
    </>
  )
}

export default App
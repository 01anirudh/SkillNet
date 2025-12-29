import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Feed from './pages/feed'
import LogIn from './pages/LogIn'
import Messeges from './pages/messeges'
import ChatBox from './pages/ChatBox'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useUser,useAuth } from '@clerk/clerk-react'
import Layout  from './pages/Layout'
import Connections from './pages/connections'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

const App = () => {
  const {user} = useUser();
  const {getToken} = useAuth();

  useEffect(()=>{
    if(user) {
      getToken().then((token)=>console.log(token))
    }
  },[user])
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path = '/' element = {!user ? <LogIn/>:<Layout/>}>
        <Route index element = {<Feed/>}/>
        <Route path='messages' element={<Messeges/>}/>
        <Route path='messages/:userId' element={<ChatBox/>}/>
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
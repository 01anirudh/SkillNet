import React from 'react'
import { assets } from '../assets/assets'

const Loading = ({height = '100vh'}) => {
  return (
    <div style={{height}} className='flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden'>
        {/* Ambient Background Effect */}
        <div className='absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-slate-50 pointer-events-none'/>
        
        {/* Logo Container */}
        <div className='relative z-10 flex flex-col items-center gap-6'>
            <div className='relative'>
                <div className='absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse'/>
                <img src={assets.logo} alt="SkillNet" className='w-16 h-16 relative z-10 drop-shadow-sm'/>
            </div>
            
            {/* Loading Indicator */}
            <div className='flex flex-col items-center gap-3'>
                <h3 className='text-slate-700 font-semibold tracking-wide text-lg animate-pulse'>SkillNet</h3>
                
                {/* Custom Progress Bar */}
                <div className='w-48 h-1 bg-slate-200 rounded-full overflow-hidden'>
                    <div className='h-full bg-gradient-to-r from-blue-500 to-blue-600 w-1/3 rounded-full animate-[loading_1.5s_ease-in-out_infinite]'/>
                </div>
            </div>
        </div>
        
        <style>{`
            @keyframes loading {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(100%); width: 50%; }
                100% { transform: translateX(200%); }
            }
        `}</style>
    </div>
  )
}

export default Loading
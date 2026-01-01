import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router'

const MenuItems = ({setSideBarOpen}) => {
  return (
    <div className='px-6 text-gray-600 space-y-1 font-medium'>
        {
            menuItemsData.map(({to,label,Icon})=>(
                <NavLink key={to} to={to} end = {to === '/'} onClick={()=>setSideBarOpen(false)}
                className={({isActive})=>`px-4 py-3 flex items-center gap-3 rounded-lg transition duration-200 ${isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}> 
                    <Icon className="w-5 h-5"/>
                    <span className="font-medium">{label}</span>
                </NavLink>
            ))
        }
    </div>
  )
}

export default MenuItems
import React from "react";
import { assets, dummyUserData } from "../assets/assets";
import { Link, useNavigate } from "react-router";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut } from "lucide-react";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state)=>state.user.value);
  const { signOut } = useClerk();
  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-slate-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 h-screen
            ${
              sideBarOpen ? "translate-x-0 shadow-2xl" : "max-sm:-translate-x-full"
            } transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          className="w-28 ml-7 my-4 cursor-pointer"
          alt="SkillNet"
        />
        
        <div className="px-4">
            <MenuItems setSideBarOpen={setSideBarOpen} />
        </div>

        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-3 mt-6 mx-6 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 transition text-white font-medium shadow-md shadow-blue-200"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>
      <div className="w-full border-t border-slate-200 p-5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
        <div className="flex gap-3 items-center">
          <UserButton />
          <div>
            <h1 className="text-sm font-semibold text-slate-700">{user.full_name}</h1>
            <p className="text-xs text-slate-400">@{user.username}</p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-5 text-slate-400 hover:text-red-500 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SideBar;

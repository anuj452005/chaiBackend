import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaCompass,
  FaHistory,
  FaPlayCircle,
  FaThumbsUp,
  FaClock,
  FaList,
  FaYoutube,
  FaUserCircle,
  FaVideo,
  FaFire,
  FaGamepad,
  FaMusic,
  FaNewspaper,
  FaGraduationCap,
} from "react-icons/fa";

const Sidebar = ({ isOpen, isVideoPage }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Define sidebar sections
  const mainLinks = [
    { icon: <FaHome />, text: "Home", path: "/" },
    { icon: <FaCompass />, text: "Explore", path: "/explore" },
    { icon: <FaPlayCircle />, text: "Subscriptions", path: "/subscriptions" },
  ];
  
  const personalLinks = [
    { icon: <FaUserCircle />, text: "Your channel", path: "/profile" },
    { icon: <FaHistory />, text: "History", path: "/history" },
    { icon: <FaVideo />, text: "Your videos", path: "/profile" },
    { icon: <FaClock />, text: "Watch later", path: "/watch-later" },
    { icon: <FaThumbsUp />, text: "Liked videos", path: "/liked-videos" },
    { icon: <FaList />, text: "Playlists", path: "/playlists" },
  ];
  
  const exploreLinks = [
    { icon: <FaFire />, text: "Trending", path: "/trending" },
    { icon: <FaMusic />, text: "Music", path: "/music" },
    { icon: <FaGamepad />, text: "Gaming", path: "/gaming" },
    { icon: <FaNewspaper />, text: "News", path: "/news" },
    { icon: <FaGraduationCap />, text: "Learning", path: "/learning" },
  ];
  
  // Helper function to render sidebar links
  const renderLinks = (links) => {
    return links.map((link, index) => (
      <Link
        key={index}
        to={link.path}
        className={`flex items-center py-2 px-3 rounded-lg ${
          location.pathname === link.path
            ? "bg-gray-200"
            : "hover:bg-gray-100"
        } transition-colors`}
      >
        <span className="text-xl text-gray-700 mr-5">{link.icon}</span>
        {isOpen && <span className="text-sm">{link.text}</span>}
      </Link>
    ));
  };
  
  // Determine sidebar width based on state and page
  const sidebarWidth = isOpen ? "w-56" : "w-20";
  const sidebarVisibility = isVideoPage && !isOpen ? "hidden md:block" : "";
  
  return (
    <div className={`${sidebarWidth} ${sidebarVisibility} h-[calc(100vh-56px)] bg-white overflow-y-auto overflow-x-hidden fixed top-14 left-0 z-10 transition-all duration-300 scrollbar-thin`}>
      <div className="py-2 px-1">
        {/* Main section */}
        <div className="mb-4">
          {renderLinks(mainLinks)}
        </div>
        
        {/* Personal section - only show when logged in */}
        {user && (
          <>
            <div className="border-t border-gray-200 pt-3 mb-4">
              <h3 className={`px-3 mb-1 text-gray-500 font-medium ${!isOpen && "sr-only"}`}>
                You
              </h3>
              {renderLinks(personalLinks)}
            </div>
          </>
        )}
        
        {/* Explore section */}
        {isOpen && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <h3 className="px-3 mb-1 text-gray-500 font-medium">
              Explore
            </h3>
            {renderLinks(exploreLinks)}
          </div>
        )}
        
        {/* Footer */}
        {isOpen && (
          <div className="border-t border-gray-200 pt-3 px-3 text-xs text-gray-500">
            <div className="flex flex-wrap gap-1 mb-2">
              <a href="#" className="hover:underline">About</a>
              <a href="#" className="hover:underline">Press</a>
              <a href="#" className="hover:underline">Copyright</a>
              <a href="#" className="hover:underline">Contact</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
            </div>
            <p>© 2023 ChaiTube</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

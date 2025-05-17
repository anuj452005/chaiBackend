import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaSignOutAlt,
  FaUpload,
  FaList,
  FaSearch,
  FaBars,
  FaBell,
  FaYoutube,
  FaVideo,
  FaHistory,
  FaThumbsUp,
  FaClock,
} from "react-icons/fa";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Left section - Logo and menu */}
        <div className="flex items-center">
          <button
            className="p-2 mr-2 rounded-full hover:bg-gray-200 lg:mr-4"
            onClick={toggleSidebar}
          >
            <FaBars className="text-gray-700" />
          </button>

          <Link to="/" className="flex items-center">
            <FaYoutube className="text-primary-color text-3xl mr-1" />
            <span className="font-bold text-xl">
              Chai<span className="hidden sm:inline">Tube</span>
            </span>
          </Link>
        </div>

        {/* Middle section - Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl mx-4"
        >
          <div className="relative flex w-full">
            <input
              type="text"
              placeholder="Search videos..."
              className="form-control rounded-l-full rounded-r-none border-r-0 py-2 px-4 w-full focus:border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-200 px-5 rounded-r-full border border-gray-300"
            >
              <FaSearch className="text-gray-600" />
            </button>
          </div>
        </form>

        {/* Mobile search icon */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-200"
          onClick={() => navigate("/search")}
        >
          <FaSearch className="text-gray-700" />
        </button>

        {/* Right section - User menu */}
        <div className="flex items-center">
          {user ? (
            <>
              <Link
                to="/upload"
                className="p-2 mx-2 rounded-full hover:bg-gray-200 hidden sm:block"
                title="Upload video"
              >
                <FaUpload className="text-gray-700" />
              </Link>

              <div className="relative mx-2">
                <button
                  className="p-2 rounded-full hover:bg-gray-200"
                  onClick={toggleNotifications}
                  title="Notifications"
                >
                  <FaBell className="text-gray-700" />
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-medium">Notifications</h3>
                      <button className="text-sm text-primary-color">
                        Settings
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-100 flex">
                        <img
                          src="https://via.placeholder.com/40"
                          alt="Channel"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm">New video from Channel Name</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-100 flex">
                        <img
                          src="https://via.placeholder.com/40"
                          alt="Channel"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm">
                            Your comment received a reply
                          </p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative ml-2">
                <button
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={toggleMenu}
                >
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || "https://via.placeholder.com/40"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="text-gray-600" /> Your channel
                    </Link>
                    <Link
                      to="/upload"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUpload className="text-gray-600" /> Upload video
                    </Link>
                    <Link
                      to="/playlists"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaList className="text-gray-600" /> Playlists
                    </Link>
                    <Link
                      to="/history"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaHistory className="text-gray-600" /> History
                    </Link>
                    <Link
                      to="/liked-videos"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaThumbsUp className="text-gray-600" /> Liked videos
                    </Link>
                    <Link
                      to="/watch-later"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaClock className="text-gray-600" /> Watch later
                    </Link>

                    <div className="border-t border-gray-200 mt-1"></div>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaSignOutAlt className="text-gray-600" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center text-primary-color border border-primary-color rounded-full px-4 py-1.5 hover:bg-red-50"
            >
              <FaUser className="mr-2" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

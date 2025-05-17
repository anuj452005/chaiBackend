import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { getAllVideos } from "../services/videoService";
import VideoCard from "../components/videos/VideoCard";
import {
  FaHome,
  FaFire,
  FaHistory,
  FaMusic,
  FaGamepad,
  FaFilm,
  FaNewspaper,
  FaLightbulb,
} from "react-icons/fa";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await getAllVideos();

        if (response.success) {
          let filteredVideos = response.data;

          // Filter videos by search query if present
          if (searchQuery) {
            filteredVideos = filteredVideos.filter(
              (video) =>
                video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                video.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );
          }

          setVideos(filteredVideos);
        } else {
          setError("Failed to fetch videos");
        }
      } catch (error) {
        setError(
          "Error fetching videos: " + (error.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery]);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // YouTube-like sidebar categories with paths
  const categories = [
    {
      icon: <FaHome />,
      name: "Home",
      path: "/",
      active: location.pathname === "/",
    },
    {
      icon: <FaFire />,
      name: "Trending",
      path: "/trending",
      active: location.pathname === "/trending",
    },
    {
      icon: <FaHistory />,
      name: "History",
      path: "/history",
      active: location.pathname === "/history",
    },
    {
      icon: <FaMusic />,
      name: "Music",
      path: "/music",
      active: location.pathname === "/music",
    },
    {
      icon: <FaGamepad />,
      name: "Gaming",
      path: "/gaming",
      active: location.pathname === "/gaming",
    },
    {
      icon: <FaFilm />,
      name: "Movies",
      path: "/movies",
      active: location.pathname === "/movies",
    },
    {
      icon: <FaNewspaper />,
      name: "News",
      path: "/news",
      active: location.pathname === "/news",
    },
    {
      icon: <FaLightbulb />,
      name: "Learning",
      path: "/learning",
      active: location.pathname === "/learning",
    },
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <div className="flex">
      {/* YouTube-like Sidebar */}
      <div
        className={`bg-gray-100 h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <button
          onClick={toggleSidebar}
          className="p-2 m-2 rounded-full hover:bg-gray-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="mt-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-200 ${category.active ? "bg-gray-200" : ""}`}
              onClick={() => handleCategoryClick(category.path)}
            >
              <div className="text-xl">{category.icon}</div>
              {sidebarOpen && <span className="ml-4">{category.name}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-gray-600">
              {videos.length} {videos.length === 1 ? "video" : "videos"} found
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No videos matching "${searchQuery}" were found.`
                : "There are no videos available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

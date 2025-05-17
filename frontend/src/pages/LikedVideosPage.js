import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getLikedVideos } from "../services/likeService";
import VideoCard from "../components/videos/VideoCard";
import Sidebar from "../components/layout/Sidebar";
import { FaThumbsUp, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LikedVideosPage = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getLikedVideos(page);

        if (response.success) {
          setVideos(response.data.videos);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setError(response.message || "Failed to fetch liked videos");
          toast.error(response.message || "Failed to fetch liked videos");
        }
      } catch (error) {
        setError("Error fetching liked videos: " + (error.message || "Unknown error"));
        toast.error("Error fetching liked videos");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, [user, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <FaThumbsUp className="mx-auto text-gray-400 text-5xl mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your liked videos</h1>
          <p className="text-gray-600 mb-6">
            Videos that you have liked will be shown here
          </p>
          <Link
            to="/login"
            className="bg-primary-color text-white px-6 py-2 rounded-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <div
          className={`flex-1 ${sidebarOpen ? "ml-56" : "ml-0 md:ml-20"} transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center mb-6">
              <FaThumbsUp className="text-primary-color mr-3" size={24} />
              <h1 className="text-2xl font-bold">Liked Videos</h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-primary-color" size={40} />
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-md shadow-sm">
                <FaThumbsUp className="mx-auto text-gray-400 text-4xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">No liked videos yet</h3>
                <p className="text-gray-600">
                  Videos that you like will be shown here
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 rounded-md mr-2 bg-white border disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-1 rounded-md mx-1 ${
                            page === i + 1
                              ? "bg-primary-color text-white"
                              : "bg-white border"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded-md ml-2 bg-white border disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedVideosPage;

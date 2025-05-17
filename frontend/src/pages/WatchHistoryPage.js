import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWatchHistory } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/videos/VideoCard";
import { FaHistory, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const WatchHistoryPage = () => {
  const { user } = useAuth();
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      console.log("Fetching watch history...");
      const response = await getWatchHistory();
      console.log("Watch history response:", response);

      if (response.success) {
        setWatchHistory(response.data);
        console.log(
          "Watch history loaded successfully:",
          response.data.length,
          "videos"
        );
      } else {
        console.error("Failed to fetch watch history:", response);
        setError(
          "Failed to fetch watch history: " +
            (response.message || "Unknown error")
        );
        toast.error(response.message || "Failed to load watch history");
      }
    } catch (error) {
      console.error("Exception when fetching watch history:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setError("Error fetching watch history: " + errorMessage);
      toast.error("Failed to load watch history: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FaHistory className="mr-2" /> Watch History
        </h1>
      </div>

      {watchHistory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchHistory.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No watch history yet</h3>
          <p className="text-gray-600 mb-4">
            Videos you watch will appear here
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Videos
          </Link>
        </div>
      )}
    </div>
  );
};

export default WatchHistoryPage;

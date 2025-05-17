import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentUserSubscribedChannels } from "../services/subscriptionService";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaVideo } from "react-icons/fa";
import toast from "react-hot-toast";

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscribedChannels();
  }, [user]);

  const fetchSubscribedChannels = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Ensure we have the user ID in localStorage for other components
      if (!localStorage.getItem("userId") && user._id) {
        localStorage.setItem("userId", user._id);
      }

      // Use the new endpoint that doesn't require a user ID parameter
      const response = await getCurrentUserSubscribedChannels();

      if (response.success) {
        setSubscribedChannels(response.data);
      } else {
        setError("Failed to fetch subscribed channels");
      }
    } catch (error) {
      setError(
        "Error fetching subscribed channels: " +
          (error.message || "Unknown error")
      );
      toast.error("Failed to load subscribed channels");
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
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-8">My Subscriptions</h1>

      {subscribedChannels.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
          <p className="text-gray-600 mb-4">
            Subscribe to channels to see their content here
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Channels
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subscribedChannels.map((subscription) => (
            <div
              key={subscription.channel._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={
                      subscription.channel.avatar ||
                      "https://via.placeholder.com/40"
                    }
                    alt={subscription.channel.username}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-medium">
                      {subscription.channel.fullName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      @{subscription.channel.username}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Link
                    to={`/channel/${subscription.channel.username}`}
                    className="text-primary-color hover:text-primary-dark flex items-center"
                  >
                    <FaUser className="mr-1" /> View Channel
                  </Link>

                  <Link
                    to={`/channel/${subscription.channel.username}/videos`}
                    className="text-primary-color hover:text-primary-dark flex items-center"
                  >
                    <FaVideo className="mr-1" /> Videos
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;

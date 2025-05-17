import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllVideos } from "../services/videoService";
import { getUserPlaylists } from "../services/playlistService";
import {
  getChannelSubscribers,
  getCurrentUserSubscribedChannels,
} from "../services/subscriptionService";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaEdit,
  FaVideo,
  FaList,
  FaHistory,
  FaBell,
  FaUsers,
  FaBars,
} from "react-icons/fa";
import Sidebar from "../components/layout/Sidebar";
import VideoCard from "../components/videos/VideoCard";
import PlaylistCard from "../components/playlists/PlaylistCard";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("videos");
  const [userVideos, setUserVideos] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
      });

      fetchUserContent();
    }
  }, [user]);

  const fetchUserContent = async () => {
    try {
      setLoading(true);

      // Fetch user videos
      const videosResponse = await getAllVideos();
      if (videosResponse.success) {
        // Filter videos by current user
        const filteredVideos = videosResponse.data.filter(
          (video) => video.owner?._id === user._id
        );
        setUserVideos(filteredVideos);
      }

      // Fetch user playlists
      const playlistsResponse = await getUserPlaylists();
      if (playlistsResponse.success) {
        setUserPlaylists(playlistsResponse.data);
      }

      // Fetch watch history
      try {
        const historyResponse = await fetch("/api/v1/users/watch-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setWatchHistory(historyData.data);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
      }

      // Fetch subscribers
      try {
        const subscribersResponse = await getChannelSubscribers(user._id);
        if (subscribersResponse.success) {
          setSubscribers(subscribersResponse.data);
        }
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      }

      // Fetch subscriptions
      try {
        const subscriptionsResponse = await getCurrentUserSubscribedChannels();
        if (subscriptionsResponse.success) {
          setSubscriptions(subscriptionsResponse.data);

          // Store user ID in localStorage if not already there
          if (!localStorage.getItem("userId") && user._id) {
            localStorage.setItem("userId", user._id);
          }
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    } catch (error) {
      console.error("Error fetching user content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(formData);
      setShowEditModal(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">User not found</h3>
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} isVideoPage={false} />

        {/* Main Content */}
        <div
          className={`flex-1 ${sidebarOpen ? "ml-56" : "ml-0 md:ml-20"} transition-all duration-300 py-8`}
        >
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {user.coverImage && (
                <img
                  src={user.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 relative">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{user.fullName}</h1>
                      <p className="text-gray-600">@{user.username}</p>
                    </div>

                    <button
                      onClick={() => setShowEditModal(true)}
                      className="btn btn-primary mt-2 md:mt-0 flex items-center"
                    >
                      <FaEdit className="mr-2" /> Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6 text-center">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{userVideos.length}</div>
                  <div className="text-gray-600">Videos</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {userPlaylists.length}
                  </div>
                  <div className="text-gray-600">Playlists</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {watchHistory.length}
                  </div>
                  <div className="text-gray-600">Watched</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{subscribers.length}</div>
                  <div className="text-gray-600">Subscribers</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {subscriptions.length}
                  </div>
                  <div className="text-gray-600">Subscriptions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-wrap border-b">
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${
                  activeTab === "videos"
                    ? "text-primary-color border-b-2 border-primary-color"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("videos")}
              >
                <FaVideo className="inline mr-2" /> Videos
              </button>
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${
                  activeTab === "playlists"
                    ? "text-primary-color border-b-2 border-primary-color"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("playlists")}
              >
                <FaList className="inline mr-2" /> Playlists
              </button>
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${
                  activeTab === "history"
                    ? "text-primary-color border-b-2 border-primary-color"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <FaHistory className="inline mr-2" /> History
              </button>
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${
                  activeTab === "subscribers"
                    ? "text-primary-color border-b-2 border-primary-color"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("subscribers")}
              >
                <FaUsers className="inline mr-2" /> Subscribers
              </button>
              <button
                className={`flex-1 py-4 px-4 text-center font-medium ${
                  activeTab === "subscriptions"
                    ? "text-primary-color border-b-2 border-primary-color"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("subscriptions")}
              >
                <FaBell className="inline mr-2" /> Subscriptions
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
                </div>
              ) : activeTab === "videos" ? (
                userVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userVideos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                      No videos yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't uploaded any videos yet.
                    </p>
                    <Link to="/upload" className="btn btn-primary">
                      Upload a Video
                    </Link>
                  </div>
                )
              ) : activeTab === "playlists" ? (
                userPlaylists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPlaylists.map((playlist) => (
                      <PlaylistCard
                        key={playlist._id}
                        playlist={playlist}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                      No playlists yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't created any playlists yet.
                    </p>
                    <Link to="/playlists" className="btn btn-primary">
                      Create a Playlist
                    </Link>
                  </div>
                )
              ) : activeTab === "history" ? (
                watchHistory.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchHistory.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                      No watch history
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't watched any videos yet.
                    </p>
                    <Link to="/" className="btn btn-primary">
                      Browse Videos
                    </Link>
                  </div>
                )
              ) : activeTab === "subscribers" ? (
                subscribers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subscribers.map((subscriber) => (
                      <div
                        key={subscriber.subscriber._id}
                        className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          <div className="flex items-center">
                            <img
                              src={
                                subscriber.subscriber.avatar ||
                                "https://via.placeholder.com/40"
                              }
                              alt={subscriber.subscriber.username}
                              className="w-12 h-12 rounded-full mr-3"
                            />
                            <div>
                              <h3 className="font-medium">
                                {subscriber.subscriber.fullName}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                @{subscriber.subscriber.username}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                      No subscribers yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create great content to attract subscribers!
                    </p>
                    <Link to="/upload" className="btn btn-primary">
                      Upload a Video
                    </Link>
                  </div>
                )
              ) : activeTab === "subscriptions" ? (
                subscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subscriptions.map((subscription) => (
                      <div
                        key={subscription.channel._id}
                        className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                      No subscriptions yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Subscribe to channels to see their content here
                    </p>
                    <Link to="/" className="btn btn-primary">
                      Explore Channels
                    </Link>
                  </div>
                )
              ) : null}
            </div>
          </div>

          {/* Edit Profile Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">Edit Profile</h3>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="fullName"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      <FaUser className="inline mr-2" /> Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      <FaEnvelope className="inline mr-2" /> Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="btn bg-gray-200 text-gray-800 mr-2"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

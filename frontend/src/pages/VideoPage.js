import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getVideoById } from "../services/videoService";
import { getAllVideos } from "../services/videoService";
import {
  getUserPlaylists,
  addVideoToPlaylist,
  createPlaylist,
} from "../services/playlistService";
import { addToWatchHistory } from "../services/userService";
import {
  toggleSubscription,
  checkSubscriptionStatus,
} from "../services/subscriptionService";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../services/commentService";
import {
  toggleVideoLike,
  toggleCommentLike,
  checkVideoLikeStatus,
  checkCommentLikeStatus,
  getLikedVideos,
} from "../services/likeService";
import { useAuth } from "../context/AuthContext";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaShare,
  FaList,
  FaEllipsisH,
  FaRegBell,
  FaBell,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaSort,
  FaBars,
  FaDownload,
  FaFlag,
  FaCode,
  FaClosedCaptioning,
} from "react-icons/fa";
import Sidebar from "../components/layout/Sidebar";
import toast from "react-hot-toast";

// Comment Item Component
const CommentItem = ({ comment, currentUser, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showOptions, setShowOptions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = currentUser && comment.owner._id === currentUser._id;
  const replyCount = comment.replies?.length || 0;

  // Check if the comment is liked when the component mounts
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentUser) {
        try {
          const likeStatus = await checkCommentLikeStatus(comment._id);
          setLiked(likeStatus.isLiked);
          if (likeStatus.count > 0) {
            setLikeCount(likeStatus.count);
          }
        } catch (error) {
          console.error("Error checking comment like status:", error);
        }
      }
    };

    checkLikeStatus();
  }, [comment._id, currentUser]);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(comment._id, editText);
      setIsEditing(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please log in to like comments");
      return;
    }

    try {
      const response = await toggleCommentLike(comment._id);

      if (response.success) {
        const newIsLiked = response.data.liked;
        setLiked(newIsLiked);
        setLikeCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

        // No toast here to avoid too many notifications when liking comments
      } else {
        console.error("Failed to toggle comment like:", response.message);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const handleReply = () => {
    if (!replyText.trim()) return;

    // In a real implementation, you would call an API to add the reply
    toast.success("Reply functionality would be implemented in a full version");
    setReplyText("");
    setShowReplyInput(false);
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  return (
    <div className="flex items-start group py-3">
      <img
        src={comment.owner.avatar}
        alt={comment.owner.username}
        className="w-10 h-10 rounded-full mr-3"
      />
      <div className="flex-1">
        <div className="flex items-center">
          <h4 className="font-medium text-sm">{comment.owner.username}</h4>
          <span className="text-gray-500 text-xs ml-2">
            {timeAgo(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50"
              rows="2"
              autoFocus
            />
            <div className="flex items-center mt-2 space-x-2">
              <button
                className="bg-primary-color text-white px-3 py-1 rounded-sm text-sm font-medium"
                onClick={handleSaveEdit}
                disabled={!editText.trim()}
              >
                Save
              </button>
              <button
                className="text-gray-600 px-3 py-1 text-sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.content);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm">{comment.content}</p>

            <div className="flex items-center mt-1 text-sm">
              <button
                className={`flex items-center mr-4 ${liked ? "text-primary-color" : "text-gray-600"}`}
                onClick={handleLike}
              >
                <FaThumbsUp className="mr-1" size={14} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>

              <button
                className="text-gray-600 mr-4"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                Reply
              </button>

              {isOwner && (
                <div className="relative ml-auto">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    <FaEllipsisV />
                  </button>

                  {showOptions && (
                    <div className="absolute right-0 mt-1 bg-white shadow-md rounded-sm py-1 z-10 w-32">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                      >
                        <FaEdit className="mr-2" size={14} /> Edit
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center text-sm"
                        onClick={() => {
                          onDelete(comment._id);
                          setShowOptions(false);
                        }}
                      >
                        <FaTrash className="mr-2" size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {showReplyInput && (
              <div className="mt-3 flex">
                {currentUser && (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                )}
                <div className="flex-1">
                  <textarea
                    placeholder="Add a reply..."
                    className="w-full p-2 border rounded-md text-sm"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="1"
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      className="text-gray-600 px-3 py-1 text-sm"
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-primary-color text-white px-3 py-1 rounded-sm text-sm font-medium"
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {replyCount > 0 && (
              <button
                className="mt-2 text-primary-color text-sm font-medium flex items-center"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>Hide {replyCount} replies</>
                ) : (
                  <>View {replyCount} replies</>
                )}
              </button>
            )}

            {/* This would show actual replies in a real implementation */}
            {showReplies && (
              <div className="mt-2 pl-4 border-l-2 border-gray-200">
                <div className="text-sm text-gray-500">
                  Replies would be displayed here in a full implementation
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const VideoPage = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showCreatePlaylistForm, setShowCreatePlaylistForm] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribing, setSubscribing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [isVideoLiked, setIsVideoLiked] = useState(false);
  const [videoLikeCount, setVideoLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [newPlaylistData, setNewPlaylistData] = useState({
    name: "",
    description: "",
    videos: [],
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await getVideoById(videoId);

        if (response.success) {
          setVideo(response.data);

          // Set subscriber count
          if (response.data.owner) {
            setSubscriberCount(response.data.owner.subscribersCount || 0);

            // Check subscription status if user is logged in
            if (user && response.data.owner._id) {
              try {
                const isUserSubscribed = await checkSubscriptionStatus(
                  response.data.owner._id
                );
                setIsSubscribed(isUserSubscribed);
              } catch (error) {
                console.error("Error checking subscription status:", error);
              }
            }
          }

          // Fetch related videos
          fetchRelatedVideos(response.data);

          // Add to watch history if user is logged in
          if (user) {
            try {
              const watchHistoryResponse = await addToWatchHistory(videoId);
              if (watchHistoryResponse.success) {
                console.log("Added to watch history successfully");
              } else {
                console.warn(
                  "Failed to add to watch history:",
                  watchHistoryResponse.message
                );
              }

              // Check if video is liked by the user
              try {
                const likeStatus = await checkVideoLikeStatus(videoId);
                setIsVideoLiked(likeStatus.isLiked);
                if (likeStatus.count > 0) {
                  setVideoLikeCount(likeStatus.count);
                }
              } catch (error) {
                console.error("Error checking video like status:", error);
              }
            } catch (error) {
              console.error("Exception when adding to watch history:", error);
            }
          }
        } else {
          setError("Failed to fetch video");
        }
      } catch (error) {
        setError("Error fetching video: " + (error.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
    fetchComments();
  }, [videoId, user]);

  // Fetch comments for the video
  const fetchComments = async () => {
    try {
      const response = await getVideoComments(videoId);
      if (response.success) {
        setComments(response.data.comments);
      } else {
        console.warn("Failed to fetch comments:", response.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchRelatedVideos = async (currentVideo) => {
    try {
      const response = await getAllVideos();

      if (response.success) {
        // Filter out current video and limit to 8 videos
        const filtered = response.data
          .filter((v) => v._id !== currentVideo._id)
          .slice(0, 8);

        setRelatedVideos(filtered);
      }
    } catch (error) {
      console.error("Error fetching related videos:", error);
    }
  };

  const fetchUserPlaylists = async () => {
    if (!user) return;

    try {
      setLoadingPlaylists(true);
      const response = await getUserPlaylists();

      if (response.success) {
        setPlaylists(response.data);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const response = await addVideoToPlaylist(playlistId, videoId);

      if (response.success) {
        toast.success("Added to playlist");
        setShowPlaylistModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to playlist");
    }
  };

  const openPlaylistModal = () => {
    fetchUserPlaylists();
    setShowPlaylistModal(true);
    setShowCreatePlaylistForm(false);
  };

  const handlePlaylistFormChange = (e) => {
    const { name, value } = e.target;
    setNewPlaylistData({ ...newPlaylistData, [name]: value });
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    try {
      // Create the playlist
      const response = await createPlaylist(newPlaylistData);

      if (response.success) {
        toast.success("Playlist created successfully");

        // Reset form
        setNewPlaylistData({
          name: "",
          description: "",
          videos: [],
        });

        // Hide the form and refresh playlists
        setShowCreatePlaylistForm(false);
        fetchUserPlaylists();

        // Add the video to the newly created playlist
        if (response.data && response.data._id) {
          await handleAddToPlaylist(response.data._id);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create playlist");
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      const response = await addComment(videoId, commentText);

      if (response.success) {
        // Add the new comment to the comments array
        const newComment = response.data;
        setComments([newComment, ...comments]);
        setCommentText(""); // Clear the comment input
        toast.success("Comment added successfully");
      } else {
        toast.error(response.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  // Handle updating a comment
  const handleUpdateComment = async (commentId, content) => {
    try {
      const response = await updateComment(commentId, content);

      if (response.success) {
        // Update the comment in the comments array
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, content: content }
              : comment
          )
        );
        toast.success("Comment updated successfully");
      } else {
        toast.error(response.message || "Failed to update comment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update comment");
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await deleteComment(commentId);

      if (response.success) {
        // Remove the comment from the comments array
        setComments(comments.filter((comment) => comment._id !== commentId));
        toast.success("Comment deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete comment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleToggleSubscription = async () => {
    if (!user) {
      toast.error("Please log in to subscribe");
      return;
    }

    if (!video?.owner?._id) {
      toast.error("Channel information not available");
      return;
    }

    try {
      setSubscribing(true);
      const response = await toggleSubscription(video.owner._id);

      if (response.success) {
        const newIsSubscribed = !isSubscribed;
        setIsSubscribed(newIsSubscribed);

        // Update subscriber count
        setSubscriberCount((prevCount) =>
          newIsSubscribed ? prevCount + 1 : Math.max(0, prevCount - 1)
        );

        toast.success(
          newIsSubscribed
            ? "Subscribed successfully"
            : "Unsubscribed successfully"
        );
      } else {
        toast.error(response.message || "Failed to update subscription");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setSubscribing(false);
    }
  };

  // Handle video like toggle
  const handleToggleVideoLike = async () => {
    if (!user) {
      toast.error("Please log in to like videos");
      return;
    }

    try {
      setIsLikeLoading(true);
      const response = await toggleVideoLike(videoId);

      if (response.success) {
        const newIsLiked = response.data.liked;
        setIsVideoLiked(newIsLiked);

        // Update like count
        setVideoLikeCount((prevCount) =>
          newIsLiked ? prevCount + 1 : Math.max(0, prevCount - 1)
        );

        toast.success(
          newIsLiked ? "Video liked successfully" : "Video unliked successfully"
        );
      } else {
        toast.error(response.message || "Failed to update like status");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update like status"
      );
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Time ago format (for YouTube-like relative time)
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // Format view count
  const formatViews = (views) => {
    if (!views && views !== 0) return "";
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
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

  if (!video) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Video not found</h3>
        <p className="text-gray-600">
          The video you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} isVideoPage={true} />

        {/* Main Content */}
        <div
          className={`flex-1 ${sidebarOpen ? "ml-56" : "ml-0 md:ml-20"} transition-all duration-300`}
        >
          <div className="flex flex-col lg:flex-row gap-6 max-w-[1280px] mx-auto px-4">
            {/* Main Video Section */}
            <div className="lg:w-2/3 mt-6">
              {/* Video Player */}
              <div className="bg-black rounded-none sm:rounded-md overflow-hidden shadow-lg relative">
                <div className="aspect-video flex items-center justify-center">
                  <video
                    src={video.videoFile}
                    poster={video.thumbnail}
                    controls
                    className="w-full h-full"
                    onPlay={() => {
                      // Add to watch history when video starts playing
                      if (user) {
                        addToWatchHistory(videoId)
                          .then((response) => {
                            if (response.success) {
                              console.log(
                                "Added to watch history on video play"
                              );
                            } else {
                              console.warn(
                                "Failed to add to watch history on play:",
                                response.message
                              );
                            }
                          })
                          .catch((error) => {
                            console.error(
                              "Error adding to watch history on play:",
                              error
                            );
                          });
                      }
                    }}
                  />
                </div>

                {/* Video controls overlay */}
                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    className="text-white bg-black bg-opacity-50 p-2 rounded-full"
                    onClick={toggleSidebar}
                  >
                    <FaBars size={16} />
                  </button>

                  <div className="flex">
                    <button className="text-white bg-black bg-opacity-50 p-2 rounded-full mr-2">
                      <FaClosedCaptioning size={16} />
                    </button>
                    <button className="text-white bg-black bg-opacity-50 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        ></rect>
                        <path d="M8 12h8"></path>
                        <path d="M12 8v8"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-4">
                <h1 className="text-xl font-bold">{video.title}</h1>

                <div className="flex flex-wrap justify-between items-center mt-3 pb-3">
                  <div className="text-gray-700 text-sm">
                    {formatViews(video.views)} views •{" "}
                    {timeAgo(video.createdAt)}
                  </div>

                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <div className="flex items-center border-r pr-3">
                      <button
                        className={`flex flex-col items-center px-3 py-1 hover:bg-gray-100 rounded-md ${isVideoLiked ? "text-primary-color" : "text-gray-700"}`}
                        onClick={handleToggleVideoLike}
                        disabled={isLikeLoading}
                      >
                        <FaThumbsUp className="mb-1" />
                        <span className="text-xs">
                          {isLikeLoading
                            ? "..."
                            : isVideoLiked
                              ? "Liked"
                              : "Like"}
                          {videoLikeCount > 0 && ` (${videoLikeCount})`}
                        </span>
                      </button>
                      <button className="flex flex-col items-center px-3 py-1 hover:bg-gray-100 rounded-md">
                        <FaThumbsDown className="text-gray-700 mb-1" />
                        <span className="text-xs">Dislike</span>
                      </button>
                    </div>

                    <button className="flex flex-col items-center px-3 py-1 hover:bg-gray-100 rounded-md">
                      <FaShare className="text-gray-700 mb-1" />
                      <span className="text-xs">Share</span>
                    </button>

                    <button
                      className="flex flex-col items-center px-3 py-1 hover:bg-gray-100 rounded-md"
                      onClick={openPlaylistModal}
                    >
                      <FaList className="text-gray-700 mb-1" />
                      <span className="text-xs">Save</span>
                    </button>

                    <button className="flex items-center p-2 hover:bg-gray-100 rounded-full">
                      <FaEllipsisH className="text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Channel Info */}
                <div className="flex items-start justify-between mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      className="block"
                    >
                      <img
                        src={
                          video.owner?.avatar ||
                          "https://via.placeholder.com/40"
                        }
                        alt={video.owner?.username || "Channel"}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/channel/${video.owner?.username}`}
                        className="block"
                      >
                        <h3 className="font-medium hover:text-primary-color">
                          {video.owner?.username || "Unknown"}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-xs">
                        {subscriberCount} subscribers
                      </p>
                    </div>
                  </div>

                  <button
                    className={`${
                      isSubscribed
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-red-600 text-white hover:bg-red-700"
                    } px-4 py-2 rounded-sm font-medium text-sm flex items-center transition-colors`}
                    onClick={handleToggleSubscription}
                    disabled={subscribing || !user}
                  >
                    {subscribing ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </span>
                    ) : isSubscribed ? (
                      <>
                        <FaBell className="mr-2" /> Subscribed
                      </>
                    ) : (
                      <>
                        <FaRegBell className="mr-2" /> Subscribe
                      </>
                    )}
                  </button>
                </div>

                {/* Video Description */}
                <div className="mt-4 p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <span className="mr-3">{formatDate(video.createdAt)}</span>
                    <span className="mr-3">
                      {video.tags && video.tags.length > 0 && (
                        <span className="text-primary-color">
                          #{video.tags.join(" #")}
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={
                      showMoreDescription ? "" : "max-h-16 overflow-hidden"
                    }
                  >
                    <p className="whitespace-pre-line text-sm">
                      {video.description}
                    </p>
                  </div>
                  <button
                    className="text-sm text-gray-700 mt-2 hover:text-gray-900 font-medium"
                    onClick={() => setShowMoreDescription(!showMoreDescription)}
                  >
                    {showMoreDescription ? "SHOW LESS" : "SHOW MORE"}
                  </button>

                  {/* Additional video actions */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-3">
                    <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                      <FaFlag className="mr-2" /> Report
                    </button>
                    <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                      <FaDownload className="mr-2" /> Download
                    </button>
                    <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                      <FaCode className="mr-2" /> Embed
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">
                      {comments.length} Comments
                    </h3>
                    <div className="flex items-center">
                      <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                        <FaSort className="mr-2" /> Sort by
                      </button>
                    </div>
                  </div>

                  {user ? (
                    <div className="flex items-start mb-8">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder="Add a comment..."
                          className="w-full p-3 border-b focus:border-b-2 focus:border-primary-color outline-none transition-colors resize-none bg-transparent"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows="1"
                          onFocus={(e) => {
                            e.target.rows = 2;
                            e.target.classList.add(
                              "border-b-2",
                              "border-primary-color"
                            );
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.rows = 1;
                              e.target.classList.remove(
                                "border-b-2",
                                "border-primary-color"
                              );
                            }
                          }}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            className="text-gray-500 mr-3 font-medium text-sm"
                            onClick={() => setCommentText("")}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-primary-color text-white px-4 py-2 rounded-sm text-sm font-medium disabled:bg-gray-300 disabled:text-gray-500"
                            disabled={!commentText.trim()}
                            onClick={handleAddComment}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700">
                        <Link
                          to="/login"
                          className="text-primary-color font-medium"
                        >
                          Sign in
                        </Link>{" "}
                        to add a comment
                      </p>
                    </div>
                  )}

                  {comments.length > 0 ? (
                    <div className="divide-y">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment._id}
                          comment={comment}
                          currentUser={user}
                          onDelete={handleDeleteComment}
                          onUpdate={handleUpdateComment}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Be the first to comment</p>
                    </div>
                  )}

                  {comments.length > 5 && (
                    <div className="mt-4 text-center">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                        Show more comments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Videos */}
            <div className="lg:w-1/3">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Up next</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Autoplay</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="autoplay"
                        id="autoplay"
                        className="sr-only"
                      />
                      <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {relatedVideos.map((relatedVideo) => (
                    <div
                      key={relatedVideo._id}
                      className="flex space-x-2 group"
                    >
                      <Link
                        to={`/video/${relatedVideo._id}`}
                        className="w-40 h-24 flex-shrink-0 relative"
                      >
                        <img
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                          {Math.floor(relatedVideo.duration / 60)}:
                          {String(relatedVideo.duration % 60).padStart(2, "0")}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link to={`/video/${relatedVideo._id}`}>
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary-color">
                            {relatedVideo.title}
                          </h4>
                        </Link>
                        <Link
                          to={`/channel/${relatedVideo.owner?.username}`}
                          className="block"
                        >
                          <p className="text-xs text-gray-600 mt-1 hover:text-gray-900">
                            {relatedVideo.owner?.username || "Unknown"}
                          </p>
                        </Link>
                        <p className="text-xs text-gray-500">
                          {formatViews(relatedVideo.views)} views •{" "}
                          {timeAgo(relatedVideo.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {relatedVideos.length > 0 && (
                  <button className="mt-4 w-full py-2 text-sm text-primary-color font-medium hover:bg-gray-100 rounded">
                    Show more
                  </button>
                )}
              </div>
            </div>

            {/* Playlist Modal */}
            {showPlaylistModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                  <h3 className="text-lg font-medium mb-4">Save to...</h3>

                  {loadingPlaylists ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-color"></div>
                    </div>
                  ) : playlists.length === 0 ? (
                    <p className="text-gray-600 py-2">
                      You don't have any playlists yet.
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {playlists.map((playlist) => (
                        <div
                          key={playlist._id}
                          className="flex items-center py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAddToPlaylist(playlist._id)}
                        >
                          <FaList className="mr-3 text-gray-600" />
                          <span>{playlist.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {showCreatePlaylistForm ? (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Create new playlist</h4>
                        <button
                          onClick={() => setShowCreatePlaylistForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      <form onSubmit={handleCreatePlaylist}>
                        <div className="mb-3">
                          <label
                            htmlFor="name"
                            className="block text-gray-700 text-sm font-medium mb-1"
                          >
                            Playlist Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={newPlaylistData.name}
                            onChange={handlePlaylistFormChange}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Enter playlist name"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="description"
                            className="block text-gray-700 text-sm font-medium mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={newPlaylistData.description}
                            onChange={handlePlaylistFormChange}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Describe your playlist"
                            rows="3"
                            required
                          ></textarea>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowCreatePlaylistForm(false)}
                            className="text-gray-600 hover:text-gray-900 mr-3 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-primary-color text-white px-3 py-1 rounded-md text-sm"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex justify-end mt-4">
                      <button
                        className="text-gray-600 hover:text-gray-900 mr-4"
                        onClick={() => setShowPlaylistModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowCreatePlaylistForm(true)}
                        className="text-primary-color hover:text-primary-dark flex items-center"
                      >
                        <FaPlus className="mr-1" /> Create new playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistById, removeVideoFromPlaylist, deletePlaylist } from '../services/playlistService';
import { FaPlay, FaTrash, FaEdit, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const response = await getPlaylistById(playlistId);
      
      if (response.success) {
        setPlaylist(response.data);
      } else {
        setError('Failed to fetch playlist');
      }
    } catch (error) {
      setError('Error fetching playlist: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      const response = await removeVideoFromPlaylist(playlistId, videoId);
      
      if (response.success) {
        toast.success('Video removed from playlist');
        fetchPlaylist();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove video');
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const response = await deletePlaylist(playlistId);
      
      if (response.success) {
        toast.success('Playlist deleted successfully');
        navigate('/playlists');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Playlist not found</h3>
        <p className="text-gray-600 mb-4">
          The playlist you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/playlists" className="btn btn-primary">
          Back to Playlists
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => navigate('/playlists')}
          className="text-gray-600 hover:text-gray-900 mr-2"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Playlist: {playlist.name}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Playlist Thumbnail */}
          <div className="md:w-1/3 bg-gray-200 h-60 md:h-auto relative">
            {playlist.videos && playlist.videos.length > 0 ? (
              <div className="grid grid-cols-2 h-full">
                {playlist.videos.slice(0, 4).map((video, index) => (
                  <div key={index} className="overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={`Playlist thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No videos in this playlist</p>
              </div>
            )}
            
            {playlist.videos && playlist.videos.length > 0 && (
              <Link 
                to={`/video/${playlist.videos[0]._id}`}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="bg-white bg-opacity-90 rounded-full p-4">
                  <FaPlay className="text-2xl text-primary-color" />
                </div>
              </Link>
            )}
          </div>
          
          {/* Playlist Info */}
          <div className="p-6 md:w-2/3 relative">
            <div className="absolute top-6 right-6">
              <button 
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaEllipsisV />
              </button>
              
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    to={`/playlists/edit/${playlistId}`}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit Playlist
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                  >
                    <FaTrash className="mr-2" /> Delete Playlist
                  </button>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mb-2">{playlist.name}</h2>
            <p className="text-gray-600 mb-4">{playlist.description}</p>
            
            <div className="flex flex-wrap text-sm text-gray-600">
              <div className="mr-4 mb-2">
                <span className="font-medium">{playlist.videos?.length || 0}</span> videos
              </div>
              <div className="mr-4 mb-2">
                Created <span>{formatDate(playlist.createdAt)}</span>
              </div>
              <div className="mb-2">
                Last updated <span>{formatDate(playlist.updatedAt)}</span>
              </div>
            </div>
            
            {playlist.videos && playlist.videos.length > 0 && (
              <Link 
                to={`/video/${playlist.videos[0]._id}?playlist=${playlistId}`}
                className="btn btn-primary mt-4"
              >
                <FaPlay className="mr-2" /> Play All
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Videos List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-medium p-4 border-b">Videos in this playlist</h3>
        
        {playlist.videos && playlist.videos.length > 0 ? (
          <div className="divide-y">
            {playlist.videos.map((video, index) => (
              <div key={video._id} className="flex p-4 hover:bg-gray-50">
                <div className="flex-shrink-0 mr-4 text-gray-500 self-center">
                  {index + 1}
                </div>
                
                <Link to={`/video/${video._id}?playlist=${playlistId}`} className="flex-shrink-0 mr-4 relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                  <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {formatDuration(video.duration)}
                  </span>
                </Link>
                
                <div className="flex-1">
                  <Link to={`/video/${video._id}?playlist=${playlistId}`}>
                    <h4 className="font-medium hover:text-primary-color">{video.title}</h4>
                  </Link>
                  <p className="text-sm text-gray-600">{video.owner?.username || 'Unknown'}</p>
                </div>
                
                <button 
                  onClick={() => handleRemoveVideo(video._id)}
                  className="text-gray-500 hover:text-red-600 self-center"
                  title="Remove from playlist"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">This playlist doesn't have any videos yet.</p>
            <Link to="/" className="btn btn-primary">
              Browse Videos
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Delete Playlist</h3>
            <p className="mb-6">
              Are you sure you want to delete the playlist "{playlist.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn bg-gray-200 text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePlaylist}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailPage;

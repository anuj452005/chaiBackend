import React, { useState, useEffect } from 'react';
import { getUserPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '../services/playlistService';
import PlaylistCard from '../components/playlists/PlaylistCard';
import { FaPlus, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    videos: [],
  });

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await getUserPlaylists();
      
      if (response.success) {
        setPlaylists(response.data);
      } else {
        setError('Failed to fetch playlists');
      }
    } catch (error) {
      setError('Error fetching playlists: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await createPlaylist(formData);
      
      if (response.success) {
        toast.success('Playlist created successfully');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', videos: [] });
        fetchPlaylists();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await updatePlaylist({
        playlistId: currentPlaylist._id,
        name: formData.name,
        description: formData.description,
      });
      
      if (response.success) {
        toast.success('Playlist updated successfully');
        setShowEditModal(false);
        setCurrentPlaylist(null);
        fetchPlaylists();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update playlist');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deletePlaylist(currentPlaylist._id);
      
      if (response.success) {
        toast.success('Playlist deleted successfully');
        setShowDeleteModal(false);
        setCurrentPlaylist(null);
        fetchPlaylists();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '', videos: [] });
    setShowCreateModal(true);
  };

  const openEditModal = (playlist) => {
    setCurrentPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description,
      videos: playlist.videos || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (playlistId) => {
    const playlist = playlists.find(p => p._id === playlistId);
    setCurrentPlaylist(playlist);
    setShowDeleteModal(true);
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Playlists</h1>
        <button 
          className="btn btn-primary flex items-center"
          onClick={openCreateModal}
        >
          <FaPlus className="mr-2" /> Create Playlist
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first playlist to organize your favorite videos
          </p>
          <button 
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            <FaPlus className="mr-2" /> Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard 
              key={playlist._id} 
              playlist={playlist} 
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}
      
      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Playlist</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Describe your playlist"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn bg-gray-200 text-gray-800 mr-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Playlist Modal */}
      {showEditModal && currentPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Playlist</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="edit-name" className="block text-gray-700 font-medium mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="edit-description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Describe your playlist"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn bg-gray-200 text-gray-800 mr-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Delete Playlist</h3>
            <p className="mb-6">
              Are you sure you want to delete the playlist "{currentPlaylist.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn bg-gray-200 text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
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

export default PlaylistsPage;

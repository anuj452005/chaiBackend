import React from 'react';
import { Link } from 'react-router-dom';
import { FaList, FaEdit, FaTrash } from 'react-icons/fa';

const PlaylistCard = ({ playlist, onEdit, onDelete }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <Link to={`/playlist/${playlist._id}`}>
        <div className="bg-gray-200 h-40 rounded-t-md flex items-center justify-center">
          {playlist.videos && playlist.videos.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
              {playlist.videos.slice(0, 4).map((video, index) => (
                <div key={index} className="w-full h-full overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={`Playlist thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <FaList size={40} className="text-gray-400" />
          )}
        </div>
      </Link>
      
      <div className="p-3">
        <div className="flex justify-between items-start">
          <Link to={`/playlist/${playlist._id}`}>
            <h3 className="font-semibold text-lg hover:text-primary-color">
              {playlist.name}
            </h3>
          </Link>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(playlist)}
              className="text-gray-500 hover:text-primary-color"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => onDelete(playlist._id)}
              className="text-gray-500 hover:text-error-color"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {playlist.description}
        </p>
        
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          <span>{playlist.videos?.length || 0} videos</span>
          <span>Created {formatDate(playlist.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;

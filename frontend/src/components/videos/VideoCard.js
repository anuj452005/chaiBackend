import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaUser } from 'react-icons/fa';

const VideoCard = ({ video }) => {
  // Format view count
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  };

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
      <Link to={`/video/${video._id}`}>
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover rounded-t-md"
          />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </Link>
      
      <div className="p-3">
        <Link to={`/video/${video._id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary-color">
            {video.title}
          </h3>
        </Link>
        
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <FaUser className="mr-1" />
            <span>{video.owner?.username || 'Unknown'}</span>
          </div>
          <div className="flex items-center ml-4">
            <FaEye className="mr-1" />
            <span>{formatViews(video.views)} views</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {formatDate(video.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;

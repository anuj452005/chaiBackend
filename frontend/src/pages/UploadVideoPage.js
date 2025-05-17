import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../services/videoService';
import { FaUpload, FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(files[0]);
      if (name === 'videoFile') {
        setVideoPreview(previewUrl);
      } else if (name === 'thumbnail') {
        setThumbnailPreview(previewUrl);
      }
      
      // Clear error if exists
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const clearFile = (name) => {
    setFormData({ ...formData, [name]: null });
    if (name === 'videoFile') {
      setVideoPreview(null);
    } else if (name === 'thumbnail') {
      setThumbnailPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.videoFile) {
      newErrors.videoFile = 'Video file is required';
    }
    
    if (!formData.thumbnail) {
      newErrors.thumbnail = 'Thumbnail is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    setIsUploading(true);
    
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 500);
    
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        const progressInterval = simulateProgress();
        
        const response = await uploadVideo(formData);
        
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(100);
        
        if (response.success) {
          toast.success('Video uploaded successfully!');
          navigate(`/video/${response.data._id}`);
        } else {
          toast.error('Failed to upload video');
        }
      } catch (error) {
        setIsUploading(false);
        toast.error(error.response?.data?.message || 'Error uploading video');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Video</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-control ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter video title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-control h-40 ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your video"
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Video File
                </label>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-full h-40 border-2 border-dashed flex items-center justify-center mb-2 relative ${
                      errors.videoFile ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {videoPreview ? (
                      <>
                        <video 
                          src={videoPreview} 
                          className="w-full h-full object-contain"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => clearFile('videoFile')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <FaVideo className="text-gray-400 text-3xl mx-auto mb-2" />
                        <p className="text-gray-500">Click to select video file</p>
                      </div>
                    )}
                  </div>
                  
                  {!videoPreview && (
                    <label className="btn btn-secondary cursor-pointer">
                      <input
                        type="file"
                        name="videoFile"
                        onChange={handleFileChange}
                        accept="video/*"
                        className="hidden"
                      />
                      <FaUpload className="mr-2" /> Select Video
                    </label>
                  )}
                  
                  {errors.videoFile && <p className="text-red-500 text-sm mt-1">{errors.videoFile}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Thumbnail
                </label>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-full h-40 border-2 border-dashed flex items-center justify-center mb-2 relative ${
                      errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {thumbnailPreview ? (
                      <>
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail Preview" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => clearFile('thumbnail')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <FaImage className="text-gray-400 text-3xl mx-auto mb-2" />
                        <p className="text-gray-500">Click to select thumbnail</p>
                      </div>
                    )}
                  </div>
                  
                  {!thumbnailPreview && (
                    <label className="btn btn-secondary cursor-pointer">
                      <input
                        type="file"
                        name="thumbnail"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <FaUpload className="mr-2" /> Select Thumbnail
                    </label>
                  )}
                  
                  {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-color h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn bg-gray-200 text-gray-800 mr-4"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <>
                  <FaUpload className="mr-2" /> Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideoPage;

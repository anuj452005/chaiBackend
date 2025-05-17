import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaUpload } from "react-icons/fa";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    avatar: null,
    coverImage: null,
  });
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const { register, loading, authError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Log file details for debugging
      console.log(`Selected ${name} file:`, {
        name: files[0].name,
        type: files[0].type,
        size: files[0].size,
      });

      setFormData({ ...formData, [name]: files[0] });

      // Create preview URL
      const previewUrl = URL.createObjectURL(files[0]);
      if (name === "avatar") {
        setAvatarPreview(previewUrl);
      } else if (name === "coverImage") {
        setCoverImagePreview(previewUrl);
      }

      // Clear error if exists
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.avatar) {
      newErrors.avatar = "Profile picture is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submission - current form data:", formData);

    // Double check avatar file is present
    if (!formData.avatar) {
      setErrors({ ...errors, avatar: "Profile picture is required" });
      return;
    }

    if (validateForm()) {
      console.log("Form validation passed, submitting registration...");
      await register(formData);
    } else {
      console.log("Form validation failed, errors:", errors);
    }
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Create Your Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join Chai Video and start sharing your videos
          </p>
        </div>

        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-control pl-10 ${errors.username ? "border-red-500" : ""}`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control pl-10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-control ${errors.fullName ? "border-red-500" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-control pl-10 ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Create a password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-control pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Profile Picture (Required)
                </label>
                <div className="flex items-center justify-center flex-col">
                  <div
                    className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center mb-2 overflow-hidden ${
                      errors.avatar ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUpload className="text-gray-400 text-2xl" />
                    )}
                  </div>
                  <label className="btn btn-secondary cursor-pointer">
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    Choose Image
                  </label>
                  {errors.avatar && (
                    <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Cover Image (Optional)
                </label>
                <div className="flex items-center justify-center flex-col">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 overflow-hidden">
                    {coverImagePreview ? (
                      <img
                        src={coverImagePreview}
                        alt="Cover Image Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUpload className="text-gray-400 text-2xl" />
                    )}
                  </div>
                  <label className="btn btn-secondary cursor-pointer">
                    <input
                      type="file"
                      name="coverImage"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    Choose Cover
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full py-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-color hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

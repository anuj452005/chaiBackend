import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import VideoPage from "./pages/VideoPage";
import UploadVideoPage from "./pages/UploadVideoPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import WatchHistoryPage from "./pages/WatchHistoryPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import LikedVideosPage from "./pages/LikedVideosPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Check if current page is login or register to use a different layout
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Check if current page is video page to use a different layout
  const isVideoPage = location.pathname.startsWith("/video/");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">
            Please wait while we set things up for you.
          </p>
        </div>
      </div>
    );
  }

  // For auth pages, use a simplified layout without header and footer
  if (isAuthPage) {
    return (
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className={`flex-grow ${isVideoPage ? "bg-white" : "bg-gray-50"}`}>
        <div className={isVideoPage ? "max-w-7xl mx-auto px-4" : ""}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadVideoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <PlaylistsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlist/:playlistId"
              element={
                <ProtectedRoute>
                  <PlaylistDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Add routes for other YouTube-like pages */}
            <Route path="/trending" element={<HomePage />} />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <WatchHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/liked-videos"
              element={
                <ProtectedRoute>
                  <LikedVideosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watch-later"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="/search" element={<HomePage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;

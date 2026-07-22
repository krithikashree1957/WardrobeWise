import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import Outfits from './pages/Outfits';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import AvatarStudio from './pages/AvatarStudio';
import Laundry from './pages/Laundry';
import Packing from './pages/Packing';
import Shopping from './pages/Shopping';
import Marketplace from './pages/Marketplace';
import Sustainability from './pages/Sustainability';
import Statistics from './pages/Statistics';
import Search from './pages/Search';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/wardrobe" element={<ProtectedRoute><Wardrobe /></ProtectedRoute>} />
          <Route path="/wardrobe/add" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
          <Route path="/wardrobe/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
          <Route path="/outfits" element={<ProtectedRoute><Outfits /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/avatar" element={<ProtectedRoute><AvatarStudio /></ProtectedRoute>} />
          <Route path="/laundry" element={<ProtectedRoute><Laundry /></ProtectedRoute>} />
          <Route path="/packing" element={<ProtectedRoute><Packing /></ProtectedRoute>} />
          <Route path="/shopping" element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/sustainability" element={<ProtectedRoute><Sustainability /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

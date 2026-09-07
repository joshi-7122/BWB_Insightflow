import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { AuthCallback } from '@/pages/AuthCallback';
import { Dashboard } from '@/pages/Dashboard';
import { UploadPage } from '@/pages/Upload';
import { ReportDetail } from '@/pages/ReportDetail';
import { ReportsPage } from '@/pages/Reports';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected app routes wrapped by AppLayout */}
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/report/:id" element={<ReportDetail />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Catch-all → Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

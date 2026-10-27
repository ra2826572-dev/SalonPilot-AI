import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { SalonDashboard } from './components/dashboard/SalonDashboard';
import { PlatformAdminPanel } from './components/admin/PlatformAdminPanel';
import { StaffWorkspace } from './components/staff/StaffWorkspace';
import { Shield, Sparkles } from 'lucide-react';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [adminPreviewSalon, setAdminPreviewSalon] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#006a51] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-[#1a1c1a]">Verifying SalonPilot AI Session...</span>
      </div>
    );
  }

  // Not logged in -> Show Login or Registration
  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage
            onNavigateToRegister={() => setAuthView('register')}
            onOpenForgotPassword={() => setShowForgotPassword(true)}
          />
        ) : (
          <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
        )}
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </>
    );
  }

  // PLATFORM_ADMIN View
  if (user.role === 'PLATFORM_ADMIN') {
    if (adminPreviewSalon) {
      return (
        <div className="flex flex-col h-screen">
          <div className="bg-[#2f312f] text-white px-4 py-2 flex items-center justify-between text-xs z-50">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#94f5d2]" />
              <span>
                <strong>PLATFORM OWNER PREVIEW MODE</strong> — Viewing multi-tenant salon dashboard as administrator
              </span>
            </div>
            <button
              onClick={() => setAdminPreviewSalon(false)}
              className="px-2.5 py-1 rounded bg-[#006a51] hover:bg-[#168568] text-[#fcfffb] font-bold text-xs"
            >
              ← Exit to Platform Admin Panel
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SalonDashboard onSwitchToAdmin={() => setAdminPreviewSalon(false)} />
          </div>
        </div>
      );
    }
    return <PlatformAdminPanel onSwitchToSalonDashboard={() => setAdminPreviewSalon(true)} />;
  }

  // STAFF View
  if (user.role === 'STAFF') {
    return <StaffWorkspace />;
  }

  // SALON_OWNER or SALON_MANAGER View
  return <SalonDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

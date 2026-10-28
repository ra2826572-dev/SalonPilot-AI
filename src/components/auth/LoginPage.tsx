import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onOpenForgotPassword,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string, label: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
    setInfoMsg(`Filled test credentials for: ${label}`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* SalonPilot AI Logo */}
        <div className="inline-flex items-center gap-3 mb-3">
          <img
            alt="SalonPilot AI Logo"
            className="h-10 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl_rs3d7IY6SSEKj7k1T9VWQEqfnV3X9j4TSYBIXLktOrazZutlV7870deKrF_6fLDWvDtxL8V1kS8w_lwDbRUcGwEA3GsWcX8Vl6LRUVH29StTqm5gCYFd6YPIJlLAUXqng7Y3LnxJnFJEP2uH5o_kyqYfZ4n2UrvD-nmvz91afzEQf-A2qQX3cr4D7bcTPc7sk8eTfbcdlOtY5aXwo7s-6bE2aoAqcPYq0h4cJUMMBH8Or6c65hXsg"
          />
          <div className="text-left">
            <span className="font-semibold text-xl tracking-tight text-[#1a1c1a] block leading-tight">
              SalonPilot AI
            </span>
            <span className="text-xs text-[#6e7a74] font-medium tracking-wide">
              Smart Salon Manager
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#1a1c1a] mt-2">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-[#55615c]">
          Sign in to manage your salon operations or platform administration.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#e3e2df] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@salon.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs font-semibold text-[#006a51] hover:text-[#168568] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6e7a74] hover:text-[#1a1c1a]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-[#55615c] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#bdc9c2] text-[#006a51] focus:ring-[#006a51]"
                />
                <span className="ml-2 text-xs font-medium">Remember me on this browser</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#006a51] hover:bg-[#168568] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006a51] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Test Switcher */}
          <div className="mt-6 pt-5 border-t border-[#efeeeb]">
            <span className="block text-xs font-semibold text-[#6e7a74] uppercase tracking-wider mb-2 text-center">
              Quick Role Testing Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  fillCredentials('ra2826572@gmail.com', '59115911', 'Your Admin Account (ra2826572@gmail.com)')
                }
                className="col-span-2 px-2.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006a51] font-bold text-left truncate transition-colors border border-emerald-300 flex items-center justify-between"
              >
                <span>👑 Your Admin Account (ra2826572@gmail.com)</span>
                <span className="text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-bold">1-Click Sign In</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  fillCredentials('admin@salonpilot.ai', 'ChangeMeSecureAdmin2025!', 'Platform Admin')
                }
                className="px-2.5 py-1.5 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] font-medium text-left truncate transition-colors border border-[#bdc9c2]/50"
              >
                👑 Platform Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  fillCredentials('alex@maisonchic.com', 'SalonOwner2025!', 'Salon Owner (Maison Chic)')
                }
                className="px-2.5 py-1.5 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] font-medium text-left truncate transition-colors border border-[#bdc9c2]/50"
              >
                ✂️ Salon Owner
              </button>
              <button
                type="button"
                onClick={() =>
                  fillCredentials('mia@maisonchic.com', 'StaffMember2025!', 'Staff (Mia Lin)')
                }
                className="px-2.5 py-1.5 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] font-medium text-left truncate transition-colors border border-[#bdc9c2]/50"
              >
                💇 Stylist Staff
              </button>
              <button
                type="button"
                onClick={() =>
                  fillCredentials('owner@luxevelvet.com', 'VelvetOwner2025!', 'Salon 2 Owner (Tenant Isolation)')
                }
                className="px-2.5 py-1.5 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] font-medium text-left truncate transition-colors border border-[#bdc9c2]/50"
              >
                🏢 Salon 2 Owner
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#006a51] font-semibold bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-100">
              <span>⚡ Supabase PostgreSQL & Multi-Tenant Engine Active</span>
            </div>
            <p className="text-[10px] text-[#6e7a74] text-center mt-1.5 italic">
              Production-ready authentication verified via server scrypt hashes & Supabase schema.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#55615c]">
            New to SalonPilot AI?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-semibold text-[#006a51] hover:text-[#168568] hover:underline"
            >
              Create a salon account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

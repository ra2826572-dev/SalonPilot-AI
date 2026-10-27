import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Store, User, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [salonName, setSalonName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!salonName.trim()) {
      setError('Please provide your salon or studio name.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        salonName,
        fullName,
        email,
        password,
        acceptTerms,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
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
          Start Your Salon Workspace
        </h1>
        <p className="mt-1 text-sm text-[#55615c]">
          Set up autonomous booking, chair dispatch, and customer CRM in seconds.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#e3e2df] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Salon or Studio Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <Store className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  placeholder="e.g. Atelier Botanica Hair Lab"
                  className="block w-full pl-10 pr-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Owner's Full Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Sterling"
                  className="block w-full pl-10 pr-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Work Email Address
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
                  placeholder="owner@yourstudio.com"
                  className="block w-full pl-10 pr-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars with letters & numbers"
                  className="block w-full pl-10 pr-10 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6e7a74] hover:text-[#1a1c1a]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-3 text-[11px] text-[#55615c]">
                  <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-[#6e7a74]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> 8+ chars
                  </span>
                  <span className={`inline-flex items-center gap-1 ${hasLetter ? 'text-emerald-700 font-semibold' : 'text-[#6e7a74]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Letters
                  </span>
                  <span className={`inline-flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-[#6e7a74]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Numbers
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="block w-full pl-10 pr-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51] focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start text-xs text-[#55615c] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-[#bdc9c2] text-[#006a51] focus:ring-[#006a51]"
                />
                <span className="ml-2">
                  I agree to the <span className="text-[#006a51] font-semibold">Terms of Service</span> and acknowledge the <span className="text-[#006a51] font-semibold">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#006a51] hover:bg-[#168568] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006a51] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Salon Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 p-2.5 rounded-lg bg-[#efeeeb] text-[11px] text-[#55615c] text-center border border-[#bdc9c2]/40">
            🛡️ New accounts automatically provision an isolated multi-tenant salon workspace with the <strong className="text-[#1a1c1a]">SALON_OWNER</strong> role.
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#55615c]">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-semibold text-[#006a51] hover:text-[#168568] hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, KeyRound, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devTokenNotice, setDevTokenNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDevTokenNotice(null);

    if (!email) {
      setError('Please enter your account email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setSuccessMsg(data.message);
      if (data.testResetToken) {
        setDevTokenNotice(data.testResetToken);
        setResetToken(data.testResetToken);
      }
      setStep('reset');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError('Password reset token is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccessMsg('Your password has been reset successfully! You can now sign in.');
      setTimeout(() => {
        onClose();
        setStep('request');
        setSuccessMsg(null);
        setDevTokenNotice(null);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e3e2df] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6e7a74] hover:bg-[#efeeeb] hover:text-[#1a1c1a] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#006a51]/10 text-[#006a51] flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1a1c1a]">
              {step === 'request' ? 'Password Recovery' : 'Set New Password'}
            </h2>
            <p className="text-xs text-[#55615c]">
              {step === 'request'
                ? 'Enter your registered email to receive a secure reset link.'
                : 'Enter your verification token and your new strong password.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {devTokenNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <span className="font-semibold block mb-0.5">Test Preview Reset Token:</span>
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[11px] font-mono break-all block">
              {devTokenNotice}
            </code>
            <span className="text-[10px] text-blue-700 block mt-1">
              Token pre-filled below for instant verification testing.
            </span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Account Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6e7a74]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@salonpilot.ai or salon owner email"
                  className="block w-full pl-10 pr-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] placeholder-[#bdc9c2] focus:outline-none focus:ring-2 focus:ring-[#006a51]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-[#efeeeb] text-[#1a1c1a] text-sm font-semibold hover:bg-[#e3e2df] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-[#006a51] text-white text-sm font-semibold hover:bg-[#168568] transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste token from email"
                className="block w-full px-3 py-2 border border-[#bdc9c2] rounded-lg text-xs font-mono text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#006a51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters with letters & numbers"
                className="block w-full px-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#006a51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e4944] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="block w-full px-3 py-2 border border-[#bdc9c2] rounded-lg text-sm text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#006a51]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="flex-1 py-2 rounded-lg bg-[#efeeeb] text-[#1a1c1a] text-sm font-semibold hover:bg-[#e3e2df] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-[#006a51] text-white text-sm font-semibold hover:bg-[#168568] transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';
import {
  Scissors,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  LogOut,
  Calendar,
  Sparkles
} from 'lucide-react';

export const StaffWorkspace: React.FC = () => {
  const { user, salon, token, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchStaffData = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/salons/current/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const allApts: Appointment[] = await res.json();
        // Filter to staff appointments or chair
        const staffApts = allApts.filter(
          (a) => a.stylistName.toLowerCase().includes(user?.fullName.toLowerCase() || '') || true
        );
        setAppointments(staffApts);
      }
    } catch (err) {
      console.error('Failed to load staff appointments:', err);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [token]);

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/salons/current/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchStaffData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans flex flex-col">
      {/* Staff Header */}
      <header className="bg-white border-b border-[#e3e2df] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#006a51] text-white flex items-center justify-center font-bold">
            <Scissors className="w-5 h-5 text-[#94f5d2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#1a1c1a]">SalonPilot AI Stylist Terminal</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006a51] text-[10px] font-bold">
                STAFF ACCESS
              </span>
            </div>
            <span className="text-xs text-[#55615c]">
              {salon?.name || 'Maison Chic'} • Chair 01 Master Bay
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-semibold text-xs text-[#1a1c1a] block">{user?.fullName}</span>
            <span className="text-[10px] text-[#6e7a74] block">Master Colorist • 32% Comm.</span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-[#6e7a74] hover:bg-[#efeeeb] hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Staff Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Shift Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e3e2df] shadow-xs">
            <span className="text-xs text-[#6e7a74] font-semibold uppercase">Today's Chair Queue</span>
            <div className="text-2xl font-bold text-[#1a1c1a] mt-1">6 Clients</div>
            <span className="text-xs text-emerald-700 mt-1 block font-medium">3 Completed • 1 In Chair</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e3e2df] shadow-xs">
            <span className="text-xs text-[#6e7a74] font-semibold uppercase">Earned Commissions Today</span>
            <div className="text-2xl font-bold text-[#006a51] mt-1">$396.80</div>
            <span className="text-xs text-[#55615c] mt-1 block">32% of $1,240 gross chair revenue</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e3e2df] shadow-xs">
            <span className="text-xs text-[#6e7a74] font-semibold uppercase">Station Status</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">Chair 01 Active</div>
            <span className="text-xs text-[#55615c] mt-1 block">Next break: 1:45 PM (45 mins)</span>
          </div>
        </div>

        {/* Chair Queue */}
        <div className="bg-white rounded-2xl border border-[#e3e2df] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#efeeeb] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1a1c1a]">Your Chair Queue Today</h3>
              <p className="text-xs text-[#55615c]">
                Review formulas, seat incoming clients, and mark services as completed.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#006a51] bg-emerald-50 px-2.5 py-1 rounded-full">
              Live Station Feed
            </span>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-[#e3e2df] hover:border-[#006a51]/50 transition-all bg-[#faf9f6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#006a51] font-mono">{apt.timeSlot}</span>
                    <span className="text-xs text-[#6e7a74]">•</span>
                    <span className="font-semibold text-sm text-[#1a1c1a]">{apt.clientName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#55615c]">
                    Service: <strong>{apt.service}</strong> {apt.addons && `(${apt.addons})`}
                  </p>
                  <span className="text-[11px] text-[#6e7a74]">Rate: ${apt.price} • {apt.durationMinutes} min session</span>
                </div>

                <div className="flex items-center gap-2">
                  {apt.status === 'Checked In' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'In Service')}
                      className="px-3 py-1.5 rounded-lg bg-[#006a51] text-white text-xs font-semibold hover:bg-[#168568]"
                    >
                      Seat at Chair 01
                    </button>
                  )}
                  {apt.status === 'In Service' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      Complete & Finish
                    </button>
                  )}
                  {apt.status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Checked In')}
                      className="px-3 py-1.5 rounded-lg bg-[#efeeeb] text-[#1a1c1a] text-xs font-semibold hover:bg-[#e3e2df]"
                    >
                      Mark Arrived
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

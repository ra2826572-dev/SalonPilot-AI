import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Appointment, Customer, StaffMember, AiInboundCall } from '../../types';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Scissors,
  CheckCircle2,
  ChevronDown,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Shield,
  LogOut,
  AlertCircle,
  X,
  UserCheck,
  Check,
  Store,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';

export const SalonDashboard: React.FC<{ onSwitchToAdmin?: () => void }> = ({ onSwitchToAdmin }) => {
  const { user, salon, token, logout, verifyEmail } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [aiCalls, setAiCalls] = useState<AiInboundCall[]>([]);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerifiedSuccess, setEmailVerifiedSuccess] = useState(false);

  // New Appointment Modal State
  const [showNewAptModal, setShowNewAptModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newStylist, setNewStylist] = useState('Mia Lin');
  const [newService, setNewService] = useState('Full Foil & Blowout');
  const [newTime, setNewTime] = useState('2:30 PM');
  const [newPrice, setNewPrice] = useState('240');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSalonData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resApts, resCusts, resStaff, resAi] = await Promise.all([
        fetch('/api/salons/current/appointments', { headers }),
        fetch('/api/salons/current/customers', { headers }),
        fetch('/api/salons/current/staff', { headers }),
        fetch('/api/salons/current/ai-calls', { headers })
      ]);

      if (resApts.ok) setAppointments(await resApts.json());
      if (resCusts.ok) setCustomers(await resCusts.json());
      if (resStaff.ok) setStaff(await resStaff.json());
      if (resAi.ok) setAiCalls(await resAi.json());
    } catch (err) {
      console.error('Error fetching salon data:', err);
    }
  };

  useEffect(() => {
    fetchSalonData();
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
      if (res.ok) {
        fetchSalonData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/salons/current/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName: newClientName,
          clientPhone: newClientPhone,
          stylistName: newStylist,
          service: newService,
          timeSlot: newTime,
          price: Number(newPrice)
        })
      });
      if (res.ok) {
        setModalFeedback('Appointment successfully scheduled!');
        fetchSalonData();
        setTimeout(() => {
          setShowNewAptModal(false);
          setModalFeedback(null);
          setNewClientName('');
          setNewClientPhone('');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to create appointment:', err);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true);
    try {
      await verifyEmail();
      setEmailVerifiedSuccess(true);
    } catch (err) {
      console.error('Failed to verify email:', err);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.stylistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#faf9f6] text-[#1a1c1a] overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#e3e2df] flex flex-col justify-between shrink-0 select-none z-30">
        <div>
          {/* Logo & Brand */}
          <div className="p-4 flex items-center gap-3 border-b border-[#efeeeb]">
            <img
              alt="SalonPilot AI Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl_rs3d7IY6SSEKj7k1T9VWQEqfnV3X9j4TSYBIXLktOrazZutlV7870deKrF_6fLDWvDtxL8V1kS8w_lwDbRUcGwEA3GsWcX8Vl6LRUVH29StTqm5gCYFd6YPIJlLAUXqng7Y3LnxJnFJEP2uH5o_kyqYfZ4n2UrvD-nmvz91afzEQf-A2qQX3cr4D7bcTPc7sk8eTfbcdlOtY5aXwo7s-6bE2aoAqcPYq0h4cJUMMBH8Or6c65hXsg"
            />
            <div>
              <div className="font-semibold text-sm tracking-tight text-[#1a1c1a] leading-none">
                SalonPilot AI
              </div>
              <span className="text-[10px] text-[#6e7a74] font-medium tracking-wide">
                Smart Salon Manager
              </span>
            </div>
          </div>

          {/* Salon Location Switcher */}
          <div className="p-3">
            <div className="w-full flex items-center justify-between p-2.5 bg-[#efeeeb] rounded-xl text-xs font-semibold text-[#1a1c1a]">
              <div className="flex items-center gap-2 truncate">
                <Store className="w-4 h-4 text-[#006a51] shrink-0" />
                <span className="truncate">{salon?.name || 'Maison Chic (Downtown)'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6e7a74] shrink-0" />
            </div>
          </div>

          {/* Operations Navigation Links */}
          <div className="px-3 py-1">
            <span className="px-3 text-[10px] font-bold text-[#6e7a74] uppercase tracking-wider block mb-1">
              OPERATIONS
            </span>
            <nav className="space-y-0.5">
              {[
                { name: 'Overview', icon: 'dashboard' },
                { name: 'Appointments', icon: 'calendar_month' },
                { name: 'Calendar', icon: 'event' },
                { name: 'Customers', icon: 'group' },
                { name: 'Services & Pricing', icon: 'content_cut' },
                { name: 'Staff & Commissions', icon: 'badge' },
                { name: 'Payments', icon: 'payments' },
                { name: 'Loyalty & Rewards', icon: 'stars' },
                { name: 'AI Receptionist', icon: 'smart_toy', badge: 'AI' },
                { name: 'Email & SMS', icon: 'chat' },
                { name: 'Reports & Analytics', icon: 'bar_chart' },
                { name: 'Settings', icon: 'settings' }
              ].map((item) => {
                const isActive = activeNav === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveNav(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#006a51] text-white font-semibold shadow-xs'
                        : 'text-[#55615c] hover:bg-[#efeeeb] hover:text-[#1a1c1a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 text-[#006a51]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#efeeeb] space-y-3">
          {/* Platform Admin Backlink if role is PLATFORM_ADMIN */}
          {user?.role === 'PLATFORM_ADMIN' && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#2f312f] text-[#94f5d2] text-xs font-bold hover:bg-black transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Back to Admin Panel</span>
            </button>
          )}

          {/* Plan Badge */}
          <div className="p-2.5 rounded-xl bg-[#efeeeb] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#6e7a74] block uppercase font-bold">Plan</span>
              <span className="font-semibold text-[#1a1c1a]">{salon?.plan || 'Pro Studio'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>

          {/* Current User Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBRM4kfbeK7BgWpkiiwdc-k_NUOq78Yjp2D7U0eNP9b-Kf_va3fPPmCj4tfJT5NToduLseBoi1HAzgUynWGCb2pfG9f5wppiaMVzCi7npPRUHSSd3F2vX09Iymark6AfnDC6WIJECgvt73h-XKw-466B45MVmttUhyhVf6FSt2Z-KcJ9KMqiPrdE6E3ERGn1WQOX3P5ouXRwps4JBYh1W-LqfVyf5dJz8AkAat_rlZw1A0QLylAXjbmA"
                alt="Alex Rivera"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#bdc9c2]"
              />
              <div className="overflow-hidden">
                <span className="font-semibold text-xs text-[#1a1c1a] block truncate">
                  {user?.fullName || 'Alex Rivera'}
                </span>
                <span className="text-[10px] text-[#6e7a74] block truncate">
                  {user?.role === 'SALON_OWNER' ? 'Salon Director' : user?.role || 'Stylist'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#6e7a74] hover:bg-[#efeeeb] hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-14 bg-white border-b border-[#e3e2df] flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6e7a74]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search appointments, clients, staff..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#faf9f6] border border-[#e3e2df] rounded-lg text-xs text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#006a51]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-[#55615c] font-medium hidden md:flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6e7a74]" />
              <span>Thursday, Oct 24, 2024</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Salon Open • 6 Chairs Active</span>
            </div>

            <button className="relative p-2 rounded-lg text-[#55615c] hover:bg-[#efeeeb] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />
            </button>

            <button
              onClick={() => setShowNewAptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006a51] hover:bg-[#168568] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>

            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBRM4kfbeK7BgWpkiiwdc-k_NUOq78Yjp2D7U0eNP9b-Kf_va3fPPmCj4tfJT5NToduLseBoi1HAzgUynWGCb2pfG9f5wppiaMVzCi7npPRUHSSd3F2vX09Iymark6AfnDC6WIJECgvt73h-XKw-466B45MVmttUhyhVf6FSt2Z-KcJ9KMqiPrdE6E3ERGn1WQOX3P5ouXRwps4JBYh1W-LqfVyf5dJz8AkAat_rlZw1A0QLylAXjbmA"
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover border border-[#bdc9c2]"
            />
          </div>
        </header>

        {/* SUB-HEADER DEMO BANNER */}
        <div className="bg-[#006a51] text-white text-[11px] px-6 py-1.5 flex items-center justify-between shrink-0 font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#78d8b7]" />
            <span>
              <strong>MULTI-TENANT SALON WORKSPACE</strong> — Isolated tenant context: {salon?.name || 'Maison Chic'}
            </span>
          </div>
          <span className="text-[#94f5d2] font-mono text-[10px]">
            Salon Node: Downtown Flagship • SYNCED: 10:42 AM
          </span>
        </div>

        {/* EMAIL VERIFICATION WARNING BANNER */}
        {user && !user.emailVerified && !emailVerifiedSuccess && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Your email (<strong>{user.email}</strong>) is currently unverified. Confirm your email to enable SMS blast dispatch and automated payouts.
              </span>
            </div>
            <button
              onClick={handleVerifyEmail}
              disabled={isVerifyingEmail}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0"
            >
              {isVerifyingEmail ? 'Verifying...' : 'Click to Verify Email'}
            </button>
          </div>
        )}

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: OVERVIEW */}
          {activeNav === 'Overview' && (
            <>
              {/* Page Title & View Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#006a51] uppercase tracking-wider">
                    WORKSPACE OVERVIEW • Thursday, October 24, 2024
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-[#1a1c1a] mt-0.5">
                    Good morning, {user?.fullName?.split(' ')[0] || 'Alex'}
                  </h1>
                  <p className="text-xs text-[#55615c] mt-0.5">
                    Here's the real-time heartbeat and projected momentum for your studio today.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg border border-[#e3e2df] bg-white p-0.5 text-xs font-semibold">
                    <button className="px-3 py-1 rounded-md bg-[#efeeeb] text-[#1a1c1a]">
                      Today vs Yesterday
                    </button>
                    <button className="px-3 py-1 rounded-md text-[#55615c] hover:text-[#1a1c1a]">
                      vs 4-Week Avg
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewAptModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006a51] text-white text-xs font-semibold hover:bg-[#168568] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Appointment</span>
                  </button>
                </div>
              </div>

              {/* KPI 4-CARD GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1: Gross Revenue */}
                <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#55615c] mb-2">
                    <span>Today's Gross Revenue</span>
                    <span className="w-6 h-6 rounded-md bg-[#006a51]/10 text-[#006a51] flex items-center justify-center font-bold">
                      💵
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a1c1a] tracking-tight">
                    $3,840.00
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
                    </span>
                    <span className="text-[#6e7a74]">vs. yesterday ($3,360)</span>
                  </div>
                </div>

                {/* 2: Booked Sessions */}
                <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#55615c] mb-2">
                    <span>Booked Sessions</span>
                    <span className="w-6 h-6 rounded-md bg-[#006a51]/10 text-[#006a51] flex items-center justify-center font-bold">
                      📅
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a1c1a] tracking-tight">
                    28 <span className="text-xs font-normal text-[#55615c]">Slots</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#55615c]">
                    <span className="text-emerald-700 font-semibold">22 Complete</span>
                    <span>•</span>
                    <span className="text-[#1a1c1a]">4 Checked-In</span>
                    <span>•</span>
                    <span className="text-[#6e7a74]">2 Pending</span>
                  </div>
                </div>

                {/* 3: New Client Acquisition */}
                <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#55615c] mb-2">
                    <span>New Client Acquisition</span>
                    <span className="w-6 h-6 rounded-md bg-[#006a51]/10 text-[#006a51] flex items-center justify-center font-bold">
                      👥
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a1c1a] tracking-tight">
                    9 <span className="text-xs font-normal text-[#55615c]">Clients</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +28%
                    </span>
                    <span className="text-[#6e7a74]">this calendar week</span>
                  </div>
                </div>

                {/* 4: Station Utilization */}
                <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#55615c] mb-2">
                    <span>Station Utilization</span>
                    <span className="w-6 h-6 rounded-md bg-[#006a51]/10 text-[#006a51] flex items-center justify-center font-bold">
                      ✂️
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a1c1a] tracking-tight">
                    6 <span className="text-xs font-normal text-[#55615c]">of 8 Chairs Active</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#55615c]">
                    <span>75% Capacity In-Service</span>
                    <span className="text-[#6e7a74]">2 on Break</span>
                  </div>
                </div>
              </div>

              {/* 2-COLUMN MAIN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT 8 COLS: Chairs, Velocity Chart, Floor Appointments */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Floor Status & Live Chairs */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <h3 className="font-bold text-sm text-[#1a1c1a]">Floor Status & Live Chairs</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#55615c]">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" /> In Service
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-teal-600" /> Checked In
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400" /> Next Up
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Chair 1 */}
                      <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e3e2df]">
                        <div className="flex items-center justify-between text-[11px] text-[#6e7a74] mb-1">
                          <span className="font-semibold uppercase tracking-wider">CHAIR 01 • MASTER BAY</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            In Service
                          </span>
                        </div>
                        <div className="font-bold text-sm text-[#1a1c1a]">Elena Vance</div>
                        <div className="text-xs text-[#55615c] truncate">Balayage Custom Gloss + Cut</div>
                        <div className="mt-3 pt-2 border-t border-[#e3e2df] flex items-center justify-between text-[11px] text-[#55615c]">
                          <span>Stylist: <strong>Mia Lin</strong></span>
                          <span className="text-emerald-700 font-semibold">35 min left</span>
                        </div>
                      </div>

                      {/* Chair 2 */}
                      <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e3e2df]">
                        <div className="flex items-center justify-between text-[11px] text-[#6e7a74] mb-1">
                          <span className="font-semibold uppercase tracking-wider">CHAIR 02 • BARBER SUITE</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            In Service
                          </span>
                        </div>
                        <div className="font-bold text-sm text-[#1a1c1a]">Marcus Chen</div>
                        <div className="text-xs text-[#55615c] truncate">Skin Fade & Beard Sculpting</div>
                        <div className="mt-3 pt-2 border-t border-[#e3e2df] flex items-center justify-between text-[11px] text-[#55615c]">
                          <span>Stylist: <strong>Tariq Boyd</strong></span>
                          <span className="text-emerald-700 font-semibold">12 min left</span>
                        </div>
                      </div>

                      {/* Chair 3 */}
                      <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e3e2df]">
                        <div className="flex items-center justify-between text-[11px] text-[#6e7a74] mb-1">
                          <span className="font-semibold uppercase tracking-wider">CHAIR 03 • COLOR ROOM</span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                            Checked In
                          </span>
                        </div>
                        <div className="font-bold text-sm text-[#1a1c1a]">Sofia Reyes</div>
                        <div className="text-xs text-[#55615c] truncate">Silk Press & Deep Bond Mask</div>
                        <div className="mt-3 pt-2 border-t border-[#e3e2df] flex items-center justify-between text-[11px] text-[#55615c]">
                          <span>Stylist: <strong>Chloe Dupont</strong></span>
                          <span className="text-[#1a1c1a] font-semibold">Starts 11:00 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hourly Booking & Revenue Velocity SVG Chart */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-[#1a1c1a]">
                          Hourly Booking & Revenue Velocity
                        </h3>
                        <p className="text-[11px] text-[#55615c]">
                          Actual real-time revenue collection vs. 8-week Thursday baseline
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs bg-[#006a51]" /> Today's Revenue
                        </span>
                        <span className="flex items-center gap-1.5 text-[#6e7a74]">
                          <span className="w-3 h-1 bg-[#bdc9c2]" /> Expected Trend
                        </span>
                      </div>
                    </div>

                    <div className="relative pt-6">
                      <div className="h-44 w-full flex items-end justify-between gap-2 px-2">
                        {[
                          { time: '9:00 AM', height: '28%', revenue: '$180' },
                          { time: '10:00 AM', height: '54%', revenue: '$420' },
                          { time: '11:00 AM', height: '70%', revenue: '$590' },
                          { time: '12:00 PM', height: '95%', revenue: '$840 Peak', isPeak: true },
                          { time: '1:00 PM', height: '65%', revenue: '$520' },
                          { time: '2:00 PM', height: '48%', revenue: '$380' },
                          { time: '3:00 PM', height: '58%', revenue: '$460' },
                          { time: '4:00 PM', height: '35%', revenue: '$260' },
                          { time: '5:00 PM', height: '22%', revenue: '$190' }
                        ].map((bar, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {bar.isPeak && (
                              <span className="absolute -top-6 text-[10px] font-bold text-[#006a51] bg-emerald-100 px-1.5 py-0.5 rounded">
                                $840 Peak
                              </span>
                            )}
                            <div
                              style={{ height: bar.height }}
                              className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                                bar.isPeak
                                  ? 'bg-[#006a51]'
                                  : 'bg-[#168568] hover:bg-[#006a51]'
                              }`}
                            />
                            <span className="text-[10px] text-[#6e7a74] mt-2 whitespace-nowrap">
                              {bar.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Floor Appointments Table */}
                  <div className="bg-white rounded-xl border border-[#e3e2df] shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-[#efeeeb] flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#1a1c1a]">Upcoming Floor Appointments</h3>
                        <p className="text-[11px] text-[#55615c]">
                          Immediate schedule queue for the next 4 hours
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('Appointments')}
                        className="text-xs font-semibold text-[#006a51] hover:underline"
                      >
                        View Full Day →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#efeeeb] text-[#3e4944] font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Time</th>
                            <th className="py-2.5 px-4">Client</th>
                            <th className="py-2.5 px-4">Stylist</th>
                            <th className="py-2.5 px-4">Service</th>
                            <th className="py-2.5 px-4">Rate</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-4 text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#efeeeb]">
                          {filteredAppointments.slice(0, 6).map((apt) => (
                            <tr key={apt.id} className="hover:bg-[#faf9f6]">
                              <td className="py-3 px-4 font-bold text-[#1a1c1a] whitespace-nowrap">
                                {apt.timeSlot}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#1a1c1a]">{apt.clientName}</div>
                                <span className="text-[10px] text-[#6e7a74]">{apt.clientPhone}</span>
                              </td>
                              <td className="py-3 px-4 font-medium text-[#1a1c1a]">
                                {apt.stylistName}
                              </td>
                              <td className="py-3 px-4 text-[#55615c]">
                                <div>{apt.service}</div>
                                {apt.addons && (
                                  <span className="text-[10px] text-[#6e7a74]">{apt.addons}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-semibold text-[#1a1c1a]">
                                ${apt.price}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    apt.status === 'Checked In'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : apt.status === 'In Service'
                                      ? 'bg-blue-100 text-blue-800'
                                      : apt.status === 'AI Scheduled'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                {apt.status === 'Checked In' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'In Service')}
                                    className="px-2.5 py-1 rounded bg-[#006a51] hover:bg-[#168568] text-white font-semibold text-[11px] transition-colors"
                                  >
                                    Start Service
                                  </button>
                                ) : apt.status === 'Confirmed' || apt.status === 'AI Scheduled' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Checked In')}
                                    className="px-2.5 py-1 rounded bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] font-semibold text-[11px] transition-colors"
                                  >
                                    Check In
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                                    className="px-2.5 py-1 rounded bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] font-semibold text-[11px] transition-colors"
                                  >
                                    Complete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT 4 COLS: AI Receptionist Widget, Daily Booking Donut, Stylist Shift Leaderboard, Quick Tools */}
                <div className="lg:col-span-4 space-y-6">
                  {/* AI Front-Desk Engine Widget */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#006a51] text-white flex items-center justify-center font-bold">
                          🤖
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1a1c1a]">AI Front-Desk Engine</h4>
                          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                            ONLINE • ACTIVE DISPATCH
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-[#faf9f6] border border-[#e3e2df]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#55615c]">Automated Handling Rate</span>
                        <span className="font-bold text-[#006a51]">94.2%</span>
                      </div>
                      <div className="w-full bg-[#e3e2df] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#006a51] h-full rounded-full" style={{ width: '94.2%' }} />
                      </div>
                      <span className="text-[10px] text-[#6e7a74] block mt-1.5">
                        38 SMS & Web Calls handled without human desk relay today
                      </span>
                    </div>

                    {/* AI Activity Stream */}
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#1a1c1a]">
                            Auto-booked: Emma Wood for 12:30 PM
                          </span>
                          <span className="text-[10px] text-[#6e7a74] block">SMS inbound • 4 mins ago</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#1a1c1a]">
                            Rescheduled: David K. moved from 3 PM
                          </span>
                          <span className="text-[10px] text-[#6e7a74] block">Web portal • 18 mins ago</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#1a1c1a]">
                            Pre-Care Sent: 12 color prep alerts dispatched
                          </span>
                          <span className="text-[10px] text-[#6e7a74] block">Automated queue • 42 mins ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Booking Status Donut */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-sm text-[#1a1c1a]">Daily Booking Status</h4>
                      <span className="text-xs text-[#6e7a74]">28 Total Today</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-[#efeeeb]"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#006a51]"
                            strokeDasharray="86, 100"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-lg font-bold text-[#1a1c1a]">86%</span>
                          <span className="text-[8px] text-[#6e7a74] uppercase font-bold">Fulfillment</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#006a51]" />
                          <span className="text-[#55615c]">68% Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#168568]" />
                          <span className="text-[#55615c]">18% Checked In</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#78d8b7]" />
                          <span className="text-[#55615c]">10% Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#bdc9c2]" />
                          <span className="text-[#55615c]">4% Pending/Hold</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stylist Shift Leaderboard */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-[#1a1c1a]">Stylist Shift Leaderboard</h4>
                        <span className="text-[11px] text-[#6e7a74]">Booked volume and earned commissions</span>
                      </div>
                      <span className="text-sm">🏆</span>
                    </div>

                    <div className="divide-y divide-[#efeeeb]">
                      {staff.map((s) => (
                        <div key={s.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={s.avatarUrl}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#bdc9c2]"
                            />
                            <div>
                              <span className="font-semibold text-xs text-[#1a1c1a] block">{s.name}</span>
                              <span className="text-[10px] text-[#6e7a74] block">
                                {s.appointmentsCount} appointments • {s.chair.split('•')[0]}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs text-[#006a51] block">${s.revenueEarned}</span>
                            <span className="text-[10px] text-[#55615c] block">{s.commissionRate}% Comm.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Salon Tools */}
                  <div className="bg-white p-4 rounded-xl border border-[#e3e2df] shadow-xs space-y-2">
                    <span className="text-[11px] font-bold text-[#6e7a74] uppercase tracking-wider block mb-1">
                      QUICK SALON TOOLS
                    </span>
                    <button
                      onClick={() => setShowNewAptModal(true)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] hover:bg-[#efeeeb] text-xs font-semibold text-[#1a1c1a] transition-colors"
                    >
                      <span className="flex items-center gap-2">🚶 Walk-in Fast Check-In</span>
                      <span>›</span>
                    </button>
                    <button
                      onClick={() => setActiveNav('Payments')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] hover:bg-[#efeeeb] text-xs font-semibold text-[#1a1c1a] transition-colors"
                    >
                      <span className="flex items-center gap-2">💳 Quick Sale & Retail POS</span>
                      <span>›</span>
                    </button>
                    <button
                      onClick={() => setActiveNav('Email & SMS')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] hover:bg-[#efeeeb] text-xs font-semibold text-[#1a1c1a] transition-colors"
                    >
                      <span className="flex items-center gap-2">💬 Send Broadcast SMS Blast</span>
                      <span>›</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: APPOINTMENTS */}
          {activeNav === 'Appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#1a1c1a]">Appointments & Scheduling</h2>
                  <p className="text-xs text-[#55615c]">
                    Real-time floor scheduling isolated to {salon?.name || 'your salon'}.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAptModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#006a51] text-white text-xs font-semibold"
                >
                  + Add Appointment
                </button>
              </div>

              <div className="bg-white rounded-xl border border-[#e3e2df] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#efeeeb] text-[#3e4944] font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Stylist & Chair</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efeeeb]">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-[#faf9f6]">
                        <td className="py-3 px-4 font-bold text-[#1a1c1a]">{apt.timeSlot}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1a1c1a]">{apt.clientName}</div>
                          <span className="text-[10px] text-[#6e7a74]">{apt.clientPhone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#1a1c1a]">{apt.stylistName}</div>
                          <span className="text-[10px] text-[#6e7a74]">{apt.chair}</span>
                        </td>
                        <td className="py-3 px-4 text-[#55615c]">{apt.service}</td>
                        <td className="py-3 px-4 text-[#6e7a74]">{apt.durationMinutes} min</td>
                        <td className="py-3 px-4 font-semibold text-[#1a1c1a]">${apt.price}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS CRM & DOSSIER */}
          {activeNav === 'Customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#1a1c1a]">Client Dossier & Formulas</h2>
                  <p className="text-xs text-[#55615c]">
                    Proprietary formulation records. Strictly isolated to your salon tenant account.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customers.map((cust) => (
                  <div key={cust.id} className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1a1c1a]">{cust.fullName}</h4>
                        <span className="text-xs text-[#6e7a74]">{cust.phone} • {cust.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#006a51]/10 text-[#006a51] text-[10px] font-bold">
                        {cust.tier}
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded-lg bg-[#faf9f6] border border-[#e3e2df]">
                      <span className="text-[10px] font-bold text-[#6e7a74] uppercase tracking-wider block mb-1">
                        CONFIDENTIAL COLOR & SERVICE FORMULA:
                      </span>
                      <p className="text-xs text-[#1a1c1a] font-mono leading-relaxed">
                        {cust.formulaNote}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#55615c]">
                      <span>Lifetime Spend: <strong className="text-[#006a51]">${cust.lifetimeSpend}</strong></span>
                      <span>Total Bookings: <strong className="text-[#1a1c1a]">{cust.totalBookings}</strong></span>
                      <span>Cadence: <strong>{cust.cadenceWeeks} wks</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AI RECEPTIONIST */}
          {activeNav === 'AI Receptionist' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1a1c1a]">AI Front-Desk Dispatch Console</h2>
                <p className="text-xs text-[#55615c]">
                  Live telephony call transcripts and automated salon scheduling queue.
                </p>
              </div>

              <div className="space-y-3">
                {aiCalls.map((call) => (
                  <div key={call.id} className="bg-white p-5 rounded-xl border border-[#e3e2df] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-[#006a51]" />
                        <span className="font-bold text-sm text-[#1a1c1a]">{call.callerName}</span>
                        <span className="text-xs text-[#6e7a74]">{call.callerPhone}</span>
                      </div>
                      <span className="text-xs font-mono text-[#6e7a74]">{call.timestamp}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#faf9f6] border border-[#e3e2df] text-xs space-y-1.5">
                      <div>
                        <strong className="text-[#6e7a74]">Caller:</strong>{' '}
                        <span className="text-[#1a1c1a] italic">"{call.transcript}"</span>
                      </div>
                      <div>
                        <strong className="text-[#006a51]">AI Receptionist:</strong>{' '}
                        <span className="text-[#1a1c1a]">{call.aiResponse}</span>
                      </div>
                    </div>

                    <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{call.actionTaken}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeNav === 'Settings' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1a1c1a]">Salon Workspace Settings</h2>
                <p className="text-xs text-[#55615c]">
                  Manage studio hours, automated booking rules, and AI receptionist voice tone.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e3e2df] shadow-xs space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1a1c1a] block mb-1">Salon Legal Name</label>
                  <input
                    type="text"
                    defaultValue={salon?.name || 'Maison Chic'}
                    className="w-full p-2 border border-[#bdc9c2] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1a1c1a] block mb-1">Salon Phone Number</label>
                  <input
                    type="text"
                    defaultValue={salon?.phone || '+1 (555) 782-9900'}
                    className="w-full p-2 border border-[#bdc9c2] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1a1c1a] block mb-1">AI Voice Tone</label>
                  <select className="w-full p-2 border border-[#bdc9c2] rounded-lg bg-white">
                    <option>Natural Studio Voice (ElevenLabs/Gemini)</option>
                    <option>Concise Luxury Receptionist</option>
                    <option>Casual Warm Studio Greeter</option>
                  </select>
                </div>
                <button className="px-4 py-2 rounded-lg bg-[#006a51] text-white font-semibold hover:bg-[#168568]">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW APPOINTMENT MODAL */}
      {showNewAptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e3e2df] relative">
            <button
              onClick={() => setShowNewAptModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6e7a74] hover:bg-[#efeeeb]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#1a1c1a] mb-1">Schedule Floor Appointment</h3>
            <p className="text-xs text-[#55615c] mb-4">
              Add a verified booking to {salon?.name || 'your salon'} workspace.
            </p>

            {modalFeedback && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{modalFeedback}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#3e4944] block mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Jordan Price"
                  className="w-full p-2 border border-[#bdc9c2] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-[#3e4944] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2 border border-[#bdc9c2] rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#3e4944] block mb-1">Stylist</label>
                  <select
                    value={newStylist}
                    onChange={(e) => setNewStylist(e.target.value)}
                    className="w-full p-2 border border-[#bdc9c2] rounded-lg bg-white"
                  >
                    <option value="Mia Lin">Mia Lin</option>
                    <option value="Tariq Boyd">Tariq Boyd</option>
                    <option value="Chloe Dupont">Chloe Dupont</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#3e4944] block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="2:30 PM"
                    className="w-full p-2 border border-[#bdc9c2] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#3e4944] block mb-1">Service</label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Balayage & Blowout"
                  className="w-full p-2 border border-[#bdc9c2] rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-[#3e4944] block mb-1">Price ($)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="240"
                  className="w-full p-2 border border-[#bdc9c2] rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAptModal(false)}
                  className="flex-1 py-2 rounded-lg bg-[#efeeeb] text-[#1a1c1a] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#006a51] text-white font-semibold hover:bg-[#168568]"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

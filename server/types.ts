export type UserRole = 'PLATFORM_ADMIN' | 'SALON_OWNER' | 'SALON_MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  role: UserRole;
  salonId: string | null;
  emailVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: number | null;
  failedLoginAttempts: number;
  lockedUntil?: number | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

export type PublicUser = Omit<User, 'passwordHash' | 'salt' | 'verificationToken' | 'resetPasswordToken' | 'resetPasswordExpires'>;

export interface Salon {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'Starter' | 'Pro Studio' | 'Enterprise';
  status: 'active' | 'suspended' | 'trial';
  chairsCount: number;
  phone: string;
  address: string;
  createdAt: string;
  settings: {
    bookingBufferMinutes: number;
    aiReceptionistEnabled: boolean;
    aiVoiceMode: string;
    autoConfirm: boolean;
  };
}

export interface SalonMembership {
  id: string;
  userId: string;
  salonId: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: string;
  ip: string;
  userAgent: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: 'salon' | 'user' | 'platform' | 'auth' | 'security';
  targetId: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface Appointment {
  id: string;
  salonId: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  stylistName: string;
  chair: string;
  service: string;
  addons?: string;
  durationMinutes: number;
  price: number;
  status: 'Checked In' | 'In Service' | 'Confirmed' | 'AI Scheduled' | 'Completed';
  createdAt: string;
}

export interface Customer {
  id: string;
  salonId: string;
  fullName: string;
  email: string;
  phone: string;
  tier: string;
  formulaNote: string;
  lifetimeSpend: number;
  totalBookings: number;
  lastVisited: string;
  cadenceWeeks: number;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  salonId: string;
  name: string;
  roleTitle: string;
  chair: string;
  appointmentsCount: number;
  commissionRate: number;
  revenueEarned: number;
  avatarUrl: string;
}

export interface AiInboundCall {
  id: string;
  salonId: string;
  callerName: string;
  callerPhone: string;
  timestamp: string;
  transcript: string;
  aiResponse: string;
  actionTaken: string;
  channel: 'voice' | 'sms' | 'whatsapp';
  durationSeconds: number;
}

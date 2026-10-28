import type {
  User,
  Salon,
  SalonMembership,
  Session,
  AuditLog,
  Appointment,
  Customer,
  StaffMember,
  AiInboundCall
} from './types.ts';
import { hashPassword, generateToken } from './auth.ts';

class Database {
  private users = new Map<string, User>();
  private salons = new Map<string, Salon>();
  private memberships = new Map<string, SalonMembership>();
  private sessions = new Map<string, Session>();
  private auditLogs: AuditLog[] = [];
  private appointments = new Map<string, Appointment>();
  private customers = new Map<string, Customer>();
  private staffMembers = new Map<string, StaffMember>();
  private aiInboundCalls = new Map<string, AiInboundCall>();
  private initialized = false;

  // --- Users ---
  findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // --- Salons ---
  getSalonById(id: string): Salon | undefined {
    return this.salons.get(id);
  }

  getAllSalons(): Salon[] {
    return Array.from(this.salons.values());
  }

  createSalon(salon: Salon): Salon {
    this.salons.set(salon.id, salon);
    return salon;
  }

  updateSalon(id: string, updates: Partial<Salon>): Salon | undefined {
    const existing = this.salons.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.salons.set(id, updated);
    return updated;
  }

  // --- Memberships ---
  createMembership(membership: SalonMembership): SalonMembership {
    this.memberships.set(membership.id, membership);
    return membership;
  }

  getMembership(userId: string, salonId: string): SalonMembership | undefined {
    for (const m of this.memberships.values()) {
      if (m.userId === userId && m.salonId === salonId) {
        return m;
      }
    }
    return undefined;
  }

  getUserMemberships(userId: string): SalonMembership[] {
    return Array.from(this.memberships.values()).filter(m => m.userId === userId);
  }

  // --- Sessions ---
  createSession(userId: string, ip: string, userAgent: string, rememberMe = false): Session {
    const token = generateToken(32);
    // 7 days if rememberMe, else 24 hours
    const duration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: Session = {
      token,
      userId,
      expiresAt: Date.now() + duration,
      createdAt: new Date().toISOString(),
      ip,
      userAgent
    };
    this.sessions.set(token, session);
    return session;
  }

  getSession(token: string): Session | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  deleteUserSessions(userId: string): void {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }

  // --- Audit Logs ---
  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log); // newest first
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  getAuditLogs(limit = 100): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  // --- Multi-Tenant Data: Appointments ---
  getAppointmentsBySalon(salonId: string): Appointment[] {
    return Array.from(this.appointments.values()).filter(a => a.salonId === salonId);
  }

  createAppointment(apt: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.appointments.set(newApt.id, newApt);
    return newApt;
  }

  updateAppointmentStatus(id: string, salonId: string, status: Appointment['status']): Appointment | undefined {
    const apt = this.appointments.get(id);
    if (!apt || apt.salonId !== salonId) return undefined;
    apt.status = status;
    this.appointments.set(id, apt);
    return apt;
  }

  // --- Multi-Tenant Data: Customers ---
  getCustomersBySalon(salonId: string): Customer[] {
    return Array.from(this.customers.values()).filter(c => c.salonId === salonId);
  }

  createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.customers.set(newCust.id, newCust);
    return newCust;
  }

  // --- Multi-Tenant Data: Staff ---
  getStaffBySalon(salonId: string): StaffMember[] {
    return Array.from(this.staffMembers.values()).filter(s => s.salonId === salonId);
  }

  // --- Multi-Tenant Data: AI Inbound Calls ---
  getAiCallsBySalon(salonId: string): AiInboundCall[] {
    return Array.from(this.aiInboundCalls.values()).filter(c => c.salonId === salonId);
  }

  addAiCall(call: Omit<AiInboundCall, 'id'>): AiInboundCall {
    const newCall: AiInboundCall = {
      ...call,
      id: `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.aiInboundCalls.set(newCall.id, newCall);
    return newCall;
  }

  // --- One-Time Secure Bootstrap ---
  bootstrap() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Check if a PLATFORM_ADMIN already exists!
    // Per requirements: "Verify that the bootstrap process cannot overwrite an existing administrator account."
    let existingAdmin: User | undefined;
    for (const u of this.users.values()) {
      if (u.role === 'PLATFORM_ADMIN') {
        existingAdmin = u;
        break;
      }
    }

    // 1. Provision Platform Admins
    const adminEmails = [
      (process.env.INITIAL_ADMIN_EMAIL || 'admin@salonpilot.ai').trim().toLowerCase(),
      'admin@salonpilot.ai',
      'ra2826572@gmail.com'
    ];

    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || '59115911';

    for (const email of adminEmails) {
      if (!this.findUserByEmail(email)) {
        const passToHash = email === 'admin@salonpilot.ai' ? 'ChangeMeSecureAdmin2025!' : adminPassword;
        const { hash, salt } = hashPassword(passToHash);
        const adminUser: User = {
          id: `user-admin-${email.replace(/[^a-z0-9]/g, '-')}`,
          email,
          passwordHash: hash,
          salt,
          fullName: 'Platform Owner',
          role: 'PLATFORM_ADMIN',
          salonId: null,
          emailVerified: true,
          failedLoginAttempts: 0,
          createdAt: new Date().toISOString()
        };
        this.users.set(adminUser.id, adminUser);

        this.addAuditLog({
          actorId: 'system-bootstrap',
          actorEmail: email,
          actorRole: 'SYSTEM',
          action: 'INITIAL_ADMIN_BOOTSTRAP',
          targetType: 'security',
          targetId: adminUser.id,
          details: `Platform administrator account (${email}) provisioned via secure server bootstrap.`,
          ip: '127.0.0.1'
        });
      }
    }

    // 2. Provision Default Demo Salon: Maison Chic (Downtown)
    // Matches the exact visual data from the HTML attachment
    const salon1Id = 'salon-maison-chic-01';
    const salonOwnerEmail = 'alex@maisonchic.com';
    let salonOwner = this.findUserByEmail(salonOwnerEmail);

    if (!salonOwner) {
      const ownerCreds = hashPassword('SalonOwner2025!');
      salonOwner = {
        id: 'user-alex-rivera-01',
        email: salonOwnerEmail,
        passwordHash: ownerCreds.hash,
        salt: ownerCreds.salt,
        fullName: 'Alex Rivera',
        role: 'SALON_OWNER',
        salonId: salon1Id,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString()
      };
      this.users.set(salonOwner.id, salonOwner);

      const maisonChic: Salon = {
        id: salon1Id,
        name: 'Maison Chic (Downtown)',
        slug: 'maison-chic-downtown',
        ownerId: salonOwner.id,
        plan: 'Pro Studio',
        status: 'active',
        chairsCount: 8,
        phone: '+1 (555) 782-9900',
        address: '420 Haute Boulevard, Suite 100, New York, NY',
        createdAt: new Date().toISOString(),
        settings: {
          bookingBufferMinutes: 15,
          aiReceptionistEnabled: true,
          aiVoiceMode: 'Natural Studio Voice (ElevenLabs/Gemini)',
          autoConfirm: true
        }
      };
      this.salons.set(salon1Id, maisonChic);

      this.memberships.set('membership-01', {
        id: 'membership-01',
        userId: salonOwner.id,
        salonId: salon1Id,
        role: 'SALON_OWNER',
        createdAt: new Date().toISOString()
      });

      // Staff User (Mia Lin)
      const staffCreds = hashPassword('StaffMember2025!');
      const staffUser: User = {
        id: 'user-mia-lin-01',
        email: 'mia@maisonchic.com',
        passwordHash: staffCreds.hash,
        salt: staffCreds.salt,
        fullName: 'Mia Lin',
        role: 'STAFF',
        salonId: salon1Id,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString()
      };
      this.users.set(staffUser.id, staffUser);

      this.memberships.set('membership-02', {
        id: 'membership-02',
        userId: staffUser.id,
        salonId: salon1Id,
        role: 'STAFF',
        createdAt: new Date().toISOString()
      });

      // Staff Leaderboard Profiles for Maison Chic
      this.staffMembers.set('staff-1', {
        id: 'staff-1',
        salonId: salon1Id,
        name: 'Mia Lin',
        roleTitle: 'Senior Master Stylist',
        chair: 'Chair 01 • Master Bay',
        appointmentsCount: 6,
        commissionRate: 32,
        revenueEarned: 1240,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzGC3uJt8eJ_NZFClbP57Utcxg5IDf1M2T9HbccH_OYKtE3MbKlCEXtiRcn6q-Uyt1tWHdhaCMl4aiuZVrIl21BJuMWILawwo6V3YxynJfnKOHR9TRBI5QSqCfUrAyagvo_rZnl8_3mkeoU1lE16Tl42WY-F3LxJOzIK5eRbmovdxZSiyvh9i5qNrPnas-KtdAyrarKmQjxr7U5e7-CmK1wcONvMdelbRCHTxgUXdOcP3NjKUoUNMqdg'
      });
      this.staffMembers.set('staff-2', {
        id: 'staff-2',
        salonId: salon1Id,
        name: 'Tariq Boyd',
        roleTitle: 'Barber & Texture Specialist',
        chair: 'Chair 02 • Barber Suite',
        appointmentsCount: 7,
        commissionRate: 30,
        revenueEarned: 890,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe56RBDr9lrCSfu7xbbNGV-hcVuOfjIBfedRJoOzHRoDsM3V_aDvM48UkM2WgzOjN4exdFASHRZFImjbMjUw_L0p6-sH-iJakxun5yqzJl4NtLbMEiwM1L3zn-CFnBOuyc11Hf_VB9QGb-mBBRxOEeFQq_74FEH9U94puNkroPpnvAX4CLtA8qGkoTrufY_1LnPXpTR48Ds-hu1ErGGrn3DXlM-BQKu9iaHDNJIZ6En2B6kyNMHeXguQ'
      });
      this.staffMembers.set('staff-3', {
        id: 'staff-3',
        salonId: salon1Id,
        name: 'Chloe Dupont',
        roleTitle: 'Color & Scalp Therapy Lead',
        chair: 'Chair 03 • Color Room',
        appointmentsCount: 5,
        commissionRate: 28,
        revenueEarned: 720,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtEG4OQwdIlQ9hYJK7Tsa1fMfhNN4DYLz-uvdNJm33tRWJrfvpLTYr-EEkyInloGV7_J67wMbgSbd9XtchQ5O4CZXQmnN5FpqZwZ3W7srwJ2QBLaNYJ5Xu7DRyqSaqTEeT2w05XEwt6UzwTgekq9fokubTbq34S9me7v2uNlUcAz_WojY_BFFBOrqHGaltUWDhMUHNxIcN4Ma9hfQtTD4MjHWYbptPhtLeCEcezfpC_u6OLAjCTxQCpA'
      });

      // Seed Initial Appointments for Maison Chic
      const sampleAppointments: Omit<Appointment, 'id' | 'createdAt'>[] = [
        {
          salonId: salon1Id,
          timeSlot: '11:15 AM',
          clientName: 'Jessica Ward',
          clientPhone: '+1 (555) 441-2900',
          stylistName: 'Mia Lin',
          chair: 'Chair 01 • Master Bay',
          service: 'Full Foil & Blowout',
          addons: 'Toner Gloss Finish',
          durationMinutes: 90,
          price: 240,
          status: 'Checked In'
        },
        {
          salonId: salon1Id,
          timeSlot: '11:45 AM',
          clientName: 'David Kim',
          clientPhone: '+1 (555) 302-8819',
          stylistName: 'Tariq Boyd',
          chair: 'Chair 02 • Barber Suite',
          service: 'Director Scissor Cut',
          durationMinutes: 45,
          price: 95,
          status: 'Confirmed'
        },
        {
          salonId: salon1Id,
          timeSlot: '12:30 PM',
          clientName: 'Emma Wood',
          clientPhone: '+1 (555) 604-1294',
          stylistName: 'Chloe Dupont',
          chair: 'Chair 03 • Color Room',
          service: 'Hydration Scalp Therapy',
          addons: 'Aromatherapy Rinse',
          durationMinutes: 60,
          price: 160,
          status: 'AI Scheduled'
        },
        {
          salonId: salon1Id,
          timeSlot: '1:15 PM',
          clientName: 'Liam Turner',
          clientPhone: '+1 (555) 891-2309',
          stylistName: 'Samir Patel',
          chair: 'Chair 04 • Cut Station',
          service: 'Signature Texture Cut',
          durationMinutes: 45,
          price: 85,
          status: 'Confirmed'
        },
        {
          salonId: salon1Id,
          timeSlot: '10:00 AM',
          clientName: 'Elena Vance',
          clientPhone: '+1 (555) 392-8114',
          stylistName: 'Mia Lin',
          chair: 'Chair 01 • Master Bay',
          service: 'Balayage Custom Gloss + Cut',
          addons: 'Olaplex No. 3 Included',
          durationMinutes: 90,
          price: 240,
          status: 'In Service'
        },
        {
          salonId: salon1Id,
          timeSlot: '10:30 AM',
          clientName: 'Marcus Chen',
          clientPhone: '+1 (555) 782-9012',
          stylistName: 'Tariq Boyd',
          chair: 'Chair 02 • Barber Suite',
          service: 'Skin Fade & Beard Sculpting',
          addons: 'Hot Towel Conditioning',
          durationMinutes: 45,
          price: 95,
          status: 'In Service'
        },
        {
          salonId: salon1Id,
          timeSlot: '11:00 AM',
          clientName: 'Sofia Reyes',
          clientPhone: '+1 (555) 234-9988',
          stylistName: 'Chloe Dupont',
          chair: 'Chair 03 • Color Room',
          service: 'Silk Press & Deep Bond Mask',
          addons: 'Keratin Infusion',
          durationMinutes: 60,
          price: 160,
          status: 'Checked In'
        }
      ];

      for (const apt of sampleAppointments) {
        this.createAppointment(apt);
      }

      // Seed Customers for Maison Chic
      const sampleCustomers: Omit<Customer, 'id' | 'createdAt'>[] = [
        {
          salonId: salon1Id,
          fullName: 'Elena Vance',
          email: 'elena.vance@studioart.io',
          phone: '(555) 392-8114',
          tier: 'VIP Tier 1',
          formulaNote: 'Wella Illumina 9/60 (30g) + 10/1 (15g) with Pastel Developer 1.9% (1:2 ratio). Olaplex Bond Protector added (3.75ml). Client noted sensitivity to fragrance in shampoo.',
          lifetimeSpend: 3420,
          totalBookings: 24,
          lastVisited: 'Today (Oct 24)',
          cadenceWeeks: 3.2
        },
        {
          salonId: salon1Id,
          fullName: 'Marcus Chen',
          email: 'marcus.chen@techcorp.com',
          phone: '(555) 782-9012',
          tier: 'Bi-Weekly',
          formulaNote: 'Style: 0.5 Low Fade + Tea Tree Scalp massage. Beard trimmed with Wahl #2 guard taper.',
          lifetimeSpend: 1180,
          totalBookings: 16,
          lastVisited: 'Today (Oct 24)',
          cadenceWeeks: 2.0
        },
        {
          salonId: salon1Id,
          fullName: 'Jessica Ward',
          email: 'jess.ward@creativeagency.com',
          phone: '(555) 441-2900',
          tier: 'VIP Tier 2',
          formulaNote: 'Redken Shades EQ 09V + 09P toner. Client prefers warm almond milk latte during consultation.',
          lifetimeSpend: 2890,
          totalBookings: 19,
          lastVisited: 'Oct 12, 2024',
          cadenceWeeks: 4.1
        },
        {
          salonId: salon1Id,
          fullName: 'Emma Wood',
          email: 'emma.wood@designlab.io',
          phone: '(555) 604-1294',
          tier: 'AI Booked',
          formulaNote: 'Prefers: Organic scalp oil, lavender aromatherapy, cold rinse finish.',
          lifetimeSpend: 760,
          totalBookings: 5,
          lastVisited: 'Sep 15, 2024',
          cadenceWeeks: 6.0
        }
      ];

      for (const cust of sampleCustomers) {
        this.createCustomer(cust);
      }

      // Seed Live AI Inbound Calls for Maison Chic
      this.addAiCall({
        salonId: salon1Id,
        callerName: 'Emma Wood',
        callerPhone: '+1 (555) 604-1294',
        timestamp: '10:38 AM',
        transcript: 'Hi, do you have any openings for a scalp hydration treatment today after 12pm with Chloe?',
        aiResponse: 'Hello Emma! Yes, Chloe Dupont has an opening at 12:30 PM for our 60-minute Hydration Scalp Therapy ($160). Shall I lock that in for you?',
        actionTaken: 'Auto-booked Chair 03 for 12:30 PM; SMS confirmation and calendar hold sent.',
        channel: 'voice',
        durationSeconds: 42
      });

      this.addAiCall({
        salonId: salon1Id,
        callerName: 'David Kim',
        callerPhone: '+1 (555) 302-8819',
        timestamp: '10:15 AM',
        transcript: 'Need to move my scissor cut appointment from 3:00 PM to earlier if possible.',
        aiResponse: 'Certainly David! Tariq Boyd has an open slot at 11:45 AM. I have shifted your reservation to 11:45 AM.',
        actionTaken: 'Rescheduled appointment from 3:00 PM to 11:45 AM with Tariq Boyd.',
        channel: 'sms',
        durationSeconds: 18
      });

      // Second Salon for testing multi-tenant isolation!
      // "Luxe Velvet Hair Bar"
      const salon2Id = 'salon-luxe-velvet-02';
      const velvetOwnerCreds = hashPassword('VelvetOwner2025!');
      const velvetOwner: User = {
        id: 'user-velvet-owner-02',
        email: 'owner@luxevelvet.com',
        passwordHash: velvetOwnerCreds.hash,
        salt: velvetOwnerCreds.salt,
        fullName: 'Sarah Jenkins',
        role: 'SALON_OWNER',
        salonId: salon2Id,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString()
      };
      this.users.set(velvetOwner.id, velvetOwner);

      const luxeVelvet: Salon = {
        id: salon2Id,
        name: 'Luxe Velvet Hair Bar',
        slug: 'luxe-velvet-hair-bar',
        ownerId: velvetOwner.id,
        plan: 'Starter',
        status: 'active',
        chairsCount: 4,
        phone: '+1 (555) 991-4433',
        address: '88 Fashion Alley, Los Angeles, CA',
        createdAt: new Date().toISOString(),
        settings: {
          bookingBufferMinutes: 10,
          aiReceptionistEnabled: false,
          aiVoiceMode: 'Standard Voice',
          autoConfirm: false
        }
      };
      this.salons.set(salon2Id, luxeVelvet);

      this.memberships.set('membership-03', {
        id: 'membership-03',
        userId: velvetOwner.id,
        salonId: salon2Id,
        role: 'SALON_OWNER',
        createdAt: new Date().toISOString()
      });

      // Private appointment for Luxe Velvet that Maison Chic CANNOT see!
      this.createAppointment({
        salonId: salon2Id,
        timeSlot: '2:00 PM',
        clientName: 'Confidential Client (Luxe Velvet Only)',
        clientPhone: '+1 (555) 000-9999',
        stylistName: 'Sarah Jenkins',
        chair: 'Chair 01',
        service: 'Private VIP Session',
        durationMinutes: 120,
        price: 500,
        status: 'Confirmed'
      });

      this.createCustomer({
        salonId: salon2Id,
        fullName: 'Exclusive Velvet Customer',
        email: 'exclusive@velvet.com',
        phone: '(555) 000-9999',
        tier: 'Confidential',
        formulaNote: 'Proprietary formula: NEVER accessible to other salons!',
        lifetimeSpend: 5000,
        totalBookings: 10,
        lastVisited: 'Oct 20, 2024',
        cadenceWeeks: 2.0
      });
    }
  }
}

export const db = new Database();
db.bootstrap();

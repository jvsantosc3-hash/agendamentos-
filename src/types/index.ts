export type BusinessType = 'manicure' | 'barber' | 'carwash';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';
export type PaymentStatus = 'pending' | 'paid';

export type VehicleCategory = 'moto' | 'hatch' | 'sedan' | 'suv';

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  popular?: boolean;
  vehiclePricing?: {
    moto?: number;
    hatch?: number;
    sedan?: number;
    suv?: number;
  };
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatar: string;
  bio: string;
  rating: number;
  commissionRate: number; // e.g. 50% = 0.50
  workingDays: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  active: boolean;
}

export interface Appointment {
  id: string;
  businessType: BusinessType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceIds: string[];
  professionalId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  // Car wash specific
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleCategory?: VehicleCategory;
  createdAt: string;
}

export interface BusinessConfig {
  type: BusinessType;
  name: string;
  tagline: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  whatsapp: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';
  bannerImage: string;
  themeColor: string; // tailwind color class or hex
  accentBg: string;
  openingTime: string;
  closingTime: string;
  slotIntervalMinutes: number;
  cancellationPolicy: string;
}

export interface CustomerHistory {
  phone: string;
  name: string;
  email?: string;
  totalAppointments: number;
  totalSpent: number;
  lastVisitDate: string;
  notes?: string;
  vehicleInfo?: string;
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  BusinessType,
  BusinessConfig,
  Service,
  Professional,
  Appointment,
  AppointmentStatus,
  PaymentStatus,
  CustomerHistory,
} from '../types';
import {
  BUSINESS_CONFIGS,
  INITIAL_SERVICES,
  INITIAL_PROFESSIONALS,
  INITIAL_APPOINTMENTS,
} from '../data/initialData';

export type AdminTab =
  | 'dashboard'
  | 'calendar'
  | 'services'
  | 'staff'
  | 'clients'
  | 'financial'
  | 'whatsapp'
  | 'settings';

interface BusinessContextType {
  activeBusinessType: BusinessType;
  setActiveBusinessType: (type: BusinessType) => void;
  activeView: 'portal' | 'admin';
  setActiveView: (view: 'portal' | 'admin') => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;

  businessConfig: BusinessConfig;
  updateBusinessConfig: (updates: Partial<BusinessConfig>) => void;

  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;

  professionals: Professional[];
  addProfessional: (prof: Omit<Professional, 'id'>) => void;
  updateProfessional: (prof: Professional) => void;
  deleteProfessional: (id: string) => void;

  appointments: Appointment[];
  createAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, paymentStatus?: PaymentStatus) => void;
  updateAppointment: (apt: Appointment) => void;
  deleteAppointment: (id: string) => void;

  customers: CustomerHistory[];

  generateWhatsAppText: (appointment: Appointment, template: 'confirmacao' | 'lembrete' | 'pos_atendimento' | 'pronto') => string;
  openWhatsApp: (phone: string, text: string) => void;

  isQuickBookingModalOpen: boolean;
  setIsQuickBookingModalOpen: (open: boolean) => void;

  resetToInitialData: () => void;
}

const STORAGE_KEYS = {
  ACTIVE_TYPE: 'agendapro_active_type',
  CONFIGS: 'agendapro_configs',
  SERVICES: 'agendapro_services',
  PROFESSIONALS: 'agendapro_professionals',
  APPOINTMENTS: 'agendapro_appointments',
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBusinessType, setActiveBusinessTypeState] = useState<BusinessType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TYPE);
    return (saved as BusinessType) || 'manicure';
  });

  const [activeView, setActiveView] = useState<'portal' | 'admin'>('portal');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isQuickBookingModalOpen, setIsQuickBookingModalOpen] = useState(false);

  const [configs, setConfigs] = useState<Record<BusinessType, BusinessConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIGS);
      return saved ? JSON.parse(saved) : BUSINESS_CONFIGS;
    } catch {
      return BUSINESS_CONFIGS;
    }
  });

  const [servicesMap, setServicesMap] = useState<Record<BusinessType, Service[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [professionalsMap, setProfessionalsMap] = useState<Record<BusinessType, Professional[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
      return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
    } catch {
      return INITIAL_PROFESSIONALS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TYPE, activeBusinessType);
  }, [activeBusinessType]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
  }, [configs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(servicesMap));
  }, [servicesMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(professionalsMap));
  }, [professionalsMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  const setActiveBusinessType = (type: BusinessType) => {
    setActiveBusinessTypeState(type);
  };

  const businessConfig = configs[activeBusinessType] || BUSINESS_CONFIGS[activeBusinessType];
  const services = servicesMap[activeBusinessType] || [];
  const professionals = professionalsMap[activeBusinessType] || [];
  const currentAppointments = useMemo(
    () => appointments.filter((a) => a.businessType === activeBusinessType),
    [appointments, activeBusinessType]
  );

  const updateBusinessConfig = (updates: Partial<BusinessConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [activeBusinessType]: {
        ...prev[activeBusinessType],
        ...updates,
      },
    }));
  };

  const addService = (newService: Omit<Service, 'id'>) => {
    const id = `srv-${Date.now()}`;
    const fullService: Service = { ...newService, id };
    setServicesMap((prev) => ({
      ...prev,
      [activeBusinessType]: [fullService, ...prev[activeBusinessType]],
    }));
  };

  const updateService = (updated: Service) => {
    setServicesMap((prev) => ({
      ...prev,
      [activeBusinessType]: prev[activeBusinessType].map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const deleteService = (id: string) => {
    setServicesMap((prev) => ({
      ...prev,
      [activeBusinessType]: prev[activeBusinessType].filter((s) => s.id !== id),
    }));
  };

  const addProfessional = (newProf: Omit<Professional, 'id'>) => {
    const id = `prof-${Date.now()}`;
    const fullProf: Professional = { ...newProf, id };
    setProfessionalsMap((prev) => ({
      ...prev,
      [activeBusinessType]: [...prev[activeBusinessType], fullProf],
    }));
  };

  const updateProfessional = (updated: Professional) => {
    setProfessionalsMap((prev) => ({
      ...prev,
      [activeBusinessType]: prev[activeBusinessType].map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const deleteProfessional = (id: string) => {
    setProfessionalsMap((prev) => ({
      ...prev,
      [activeBusinessType]: prev[activeBusinessType].filter((p) => p.id !== id),
    }));
  };

  const createAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  const updateAppointmentStatus = (
    id: string,
    status: AppointmentStatus,
    paymentStatus?: PaymentStatus
  ) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status,
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(status === 'completed' && !paymentStatus ? { paymentStatus: 'paid' } : {}),
          };
        }
        return a;
      })
    );
  };

  const updateAppointment = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // Customers computed from appointments
  const customers = useMemo<CustomerHistory[]>(() => {
    const map = new Map<string, CustomerHistory>();

    currentAppointments.forEach((apt) => {
      const cleanPhone = apt.customerPhone.replace(/\D/g, '') || apt.customerName;
      const existing = map.get(cleanPhone);
      const isPaid = apt.paymentStatus === 'paid';

      if (!existing) {
        map.set(cleanPhone, {
          phone: apt.customerPhone,
          name: apt.customerName,
          email: apt.customerEmail,
          totalAppointments: 1,
          totalSpent: isPaid ? apt.totalPrice : 0,
          lastVisitDate: apt.date,
          notes: apt.notes,
          vehicleInfo: apt.vehicleModel
            ? `${apt.vehicleModel}${apt.vehiclePlate ? ` (${apt.vehiclePlate})` : ''}`
            : undefined,
        });
      } else {
        existing.totalAppointments += 1;
        if (isPaid) existing.totalSpent += apt.totalPrice;
        if (new Date(apt.date) > new Date(existing.lastVisitDate)) {
          existing.lastVisitDate = apt.date;
        }
        if (apt.vehicleModel && !existing.vehicleInfo) {
          existing.vehicleInfo = `${apt.vehicleModel}${apt.vehiclePlate ? ` (${apt.vehiclePlate})` : ''}`;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [currentAppointments]);

  const generateWhatsAppText = (
    apt: Appointment,
    template: 'confirmacao' | 'lembrete' | 'pos_atendimento' | 'pronto'
  ): string => {
    const prof = professionals.find((p) => p.id === apt.professionalId);
    const profName = prof ? prof.name : 'Nossa equipe';
    const srvNames = apt.serviceIds
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const dateFormatted = apt.date.split('-').reverse().join('/');
    const businessName = businessConfig.name;

    switch (template) {
      case 'confirmacao':
        return (
          `✨ *Confirmação de Agendamento - ${businessName}*\n\n` +
          `Olá, *${apt.customerName}*!\n` +
          `Seu agendamento foi registrado com sucesso:\n\n` +
          `📅 *Data:* ${dateFormatted}\n` +
          `⏰ *Horário:* ${apt.time}\n` +
          `⭐ *Serviço(s):* ${srvNames}\n` +
          `👤 *Profissional:* ${profName}\n` +
          `${apt.vehicleModel ? `🚗 *Veículo:* ${apt.vehicleModel} (${apt.vehiclePlate || 'N/A'})\n` : ''}` +
          `💰 *Valor:* R$ ${apt.totalPrice.toFixed(2).replace('.', ',')}\n` +
          `📍 *Local:* ${businessConfig.address} - ${businessConfig.neighborhood}\n\n` +
          `Caso precise reagendar ou cancelar, por favor nos avise com antecedência.\n` +
          `Esperamos por você!`
        );

      case 'lembrete':
        return (
          `⏰ *Lembrete de Horário - ${businessName}*\n\n` +
          `Olá, *${apt.customerName}*! Passando para lembrar do seu atendimento hoje:\n\n` +
          `⏰ *Horário:* ${apt.time}\n` +
          `⭐ *Serviço:* ${srvNames}\n` +
          `👤 *Profissional:* ${profName}\n` +
          `📍 *Endereço:* ${businessConfig.address}\n\n` +
          `Tudo pronto para te receber!`
        );

      case 'pronto':
        return (
          `🚗 *Seu veículo está pronto! - ${businessName}*\n\n` +
          `Olá, *${apt.customerName}*!\n` +
          `O serviço de ${srvNames} no seu *${apt.vehicleModel || 'veículo'}* foi finalizado com sucesso e já está pronto para retirada no pátio!\n\n` +
          `💰 *Total:* R$ ${apt.totalPrice.toFixed(2).replace('.', ',')}\n` +
          `📍 *Local:* ${businessConfig.address}\n\n` +
          `Agradecemos pela preferência!`
        );

      case 'pos_atendimento':
        return (
          `💖 *Agradecimento - ${businessName}*\n\n` +
          `Olá, *${apt.customerName}*! Foi um prazer atender você!\n` +
          `Esperamos que tenha gostado do resultado do seu serviço (${srvNames}).\n\n` +
          `Conta pra gente o que achou ou avalie nosso atendimento! Até a próxima visita.`
        );
    }
  };

  const openWhatsApp = (phone: string, text: string) => {
    const rawNumber = phone.replace(/\D/g, '');
    const cleanNumber = rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const resetToInitialData = () => {
    localStorage.removeItem(STORAGE_KEYS.CONFIGS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.PROFESSIONALS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TYPE);

    setConfigs(BUSINESS_CONFIGS);
    setServicesMap(INITIAL_SERVICES);
    setProfessionalsMap(INITIAL_PROFESSIONALS);
    setAppointments(INITIAL_APPOINTMENTS);
    setActiveBusinessTypeState('manicure');
    setActiveView('portal');
  };

  return (
    <BusinessContext.Provider
      value={{
        activeBusinessType,
        setActiveBusinessType,
        activeView,
        setActiveView,
        adminTab,
        setAdminTab,
        businessConfig,
        updateBusinessConfig,
        services,
        addService,
        updateService,
        deleteService,
        professionals,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        appointments: currentAppointments,
        createAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        customers,
        generateWhatsAppText,
        openWhatsApp,
        isQuickBookingModalOpen,
        setIsQuickBookingModalOpen,
        resetToInitialData,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

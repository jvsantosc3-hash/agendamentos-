import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { VehicleCategory } from '../../types';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Car,
  CreditCard,
  QrCode,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Star,
  Copy,
  Check,
} from 'lucide-react';

export const BookingPortal: React.FC = () => {
  const {
    activeBusinessType,
    businessConfig,
    services,
    professionals,
    appointments,
    createAppointment,
    openWhatsApp,
    generateWhatsAppText,
    setActiveView,
    setAdminTab,
  } = useBusiness();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<VehicleCategory>('hatch');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit' | 'cash'>('pix');

  // Confirmation state
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Filter active services & categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [services]);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  // Calculate pricing for a service depending on vehicle if carwash
  const getServicePrice = (service: (typeof services)[0]) => {
    if (activeBusinessType === 'carwash' && service.vehiclePricing) {
      return service.vehiclePricing[selectedVehicleCategory] ?? service.price;
    }
    return service.price;
  };

  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + getServicePrice(s), 0);
  }, [selectedServices, selectedVehicleCategory]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate date options (next 14 days)
  const dateOptions = useMemo(() => {
    const list = [];
    const base = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayOfWeek = dayNames[d.getDay()];
      const dayNum = d.getDate();
      const month = monthNames[d.getMonth()];
      const isSunday = d.getDay() === 0;

      list.push({
        iso,
        dayOfWeek,
        dayNum,
        month,
        disabled: isSunday && activeBusinessType !== 'carwash',
      });
    }
    return list;
  }, [activeBusinessType]);

  // Generate available time slots based on business hours and existing appointments
  const availableTimeSlots = useMemo(() => {
    const slots: string[] = [];
    const [startH, startM] = businessConfig.openingTime.split(':').map(Number);
    const [endH, endM] = businessConfig.closingTime.split(':').map(Number);
    const interval = businessConfig.slotIntervalMinutes || 30;

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Filter appointments for the selected date and professional
    const dayAppointments = appointments.filter((a) => {
      if (a.date !== selectedDate || a.status === 'cancelled') return false;
      if (selectedProfessionalId !== 'any' && a.professionalId !== selectedProfessionalId) {
        return false;
      }
      return true;
    });

    while (currentMinutes + 30 <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      // Check collision
      const isBooked = dayAppointments.some((a) => {
        const [aH, aM] = a.time.split(':').map(Number);
        const aStart = aH * 60 + aM;
        const aEnd = aStart + a.durationMinutes;
        return currentMinutes >= aStart && currentMinutes < aEnd;
      });

      if (!isBooked) {
        slots.push(timeStr);
      }
      currentMinutes += interval;
    }

    return slots;
  }, [businessConfig, appointments, selectedDate, selectedProfessionalId]);

  const handleFinishBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || selectedServiceIds.length === 0 || !selectedTime) {
      return;
    }

    // Determine professional if "any" was selected
    let chosenProfId = selectedProfessionalId;
    if (chosenProfId === 'any') {
      const activeProfs = professionals.filter((p) => p.active);
      chosenProfId = activeProfs.length > 0 ? activeProfs[0].id : 'p-1';
    }

    const newApt = createAppointment({
      businessType: activeBusinessType,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      serviceIds: selectedServiceIds,
      professionalId: chosenProfId,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: totalDuration || 45,
      totalPrice,
      status: 'scheduled',
      paymentMethod,
      paymentStatus: 'pending',
      notes: notes || undefined,
      vehicleCategory: activeBusinessType === 'carwash' ? selectedVehicleCategory : undefined,
      vehicleModel: activeBusinessType === 'carwash' ? vehicleModel : undefined,
      vehiclePlate: activeBusinessType === 'carwash' ? vehiclePlate.toUpperCase() : undefined,
    });

    setConfirmedAppointmentId(newApt.id);
    setStep(5);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  const confirmedAppointment = useMemo(() => {
    if (!confirmedAppointmentId) return null;
    return appointments.find((a) => a.id === confirmedAppointmentId) || null;
  }, [appointments, confirmedAppointmentId]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(businessConfig.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Hero Header with Generated Domain Photography */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-neutral-800 shadow-2xl">
        <div className="h-48 sm:h-64 w-full relative">
          <img
            src={businessConfig.bannerImage}
            alt={businessConfig.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-900/20" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1">
              Agendamento Online 24h
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
              {businessConfig.name}
            </h1>
            <p className="text-sm text-neutral-300 mt-1">{businessConfig.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                {businessConfig.address} · {businessConfig.neighborhood}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {businessConfig.openingTime} às {businessConfig.closingTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveView('admin');
                setAdminTab('dashboard');
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
            >
              Acessar Painel do Dono
            </button>
          </div>
        </div>
      </div>

      {/* Booking Flow Wizard */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 sm:p-8 shadow-xl">
        {/* Step Indicator */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className={step >= 1 ? 'text-white font-semibold' : ''}>
                1. Serviços
              </span>
              <span className={step >= 2 ? 'text-white font-semibold' : ''}>
                2. Profissional
              </span>
              <span className={step >= 3 ? 'text-white font-semibold' : ''}>
                3. Data & Hora
              </span>
              <span className={step >= 4 ? 'text-white font-semibold' : ''}>
                4. Seus Dados
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Select Services & Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Escolha os Serviços Desejados</h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                Você pode selecionar um ou mais procedimentos para o mesmo atendimento.
              </p>
            </div>

            {/* Vehicle Selector (Lava Rápido specific) */}
            {activeBusinessType === 'carwash' && (
              <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Qual é a categoria do seu veículo?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'moto', label: 'Moto' },
                      { id: 'hatch', label: 'Hatch / Compacto' },
                      { id: 'sedan', label: 'Sedan' },
                      { id: 'suv', label: 'SUV / Caminhonete' },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleCategory(v.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                        selectedVehicleCategory === v.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service Categories Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Todos ({services.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-neutral-100 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                const currentPrice = getServicePrice(service);

                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-white bg-neutral-800/80 shadow-md ring-1 ring-white/20'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-white text-sm">
                          {service.name}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-white text-neutral-950 border-white'
                              : 'border-neutral-700 bg-neutral-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/60 text-xs">
                      <span className="text-neutral-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {service.durationMinutes} min
                      </span>
                      <span className="text-sm font-bold text-white font-mono tabular-nums">
                        R$ {currentPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Bar & Next Button */}
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-400">Total Selecionado:</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                  <span className="text-xs text-neutral-400 font-sans font-normal ml-2">
                    ({totalDuration} min)
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={selectedServiceIds.length === 0}
                onClick={() => setStep(2)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedServiceIds.length > 0
                    ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Professional */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Escolha o Profissional</h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                Selecione quem você deseja que realize seu atendimento ou escolha a primeira vaga livre.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Any available */}
              <div
                onClick={() => setSelectedProfessionalId('any')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedProfessionalId === 'any'
                    ? 'border-white bg-neutral-800/80 shadow-md ring-1 ring-white/20'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white shrink-0 border border-neutral-700">
                    <User className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      Qualquer Profissional
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Maior flexibilidade de horários livres
                    </div>
                  </div>
                </div>
              </div>

              {/* Specific professionals */}
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfessionalId(prof.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedProfessionalId === prof.id
                      ? 'border-white bg-neutral-800/80 shadow-md ring-1 ring-white/20'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-white text-sm">{prof.name}</div>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{prof.rating}</span>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">{prof.role}</div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{prof.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar aos Serviços</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-100 transition-all shadow"
              >
                <span>Avançar para Horários</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Date & Available Time Slot */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Escolha a Data e Horário</h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                Horários calculados em tempo real de acordo com a duração dos serviços selecionados ({totalDuration} min).
              </p>
            </div>

            {/* Date Carousel Strip */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                1. Selecione o Dia
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {dateOptions.map((d) => {
                  const isSelected = selectedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      disabled={d.disabled}
                      onClick={() => {
                        setSelectedDate(d.iso);
                        setSelectedTime('');
                      }}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-xl border transition-all ${
                        d.disabled
                          ? 'opacity-40 cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600'
                          : isSelected
                          ? 'border-white bg-white text-neutral-950 shadow-md font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider font-mono">
                        {d.dayOfWeek}
                      </span>
                      <span className="text-lg font-bold font-mono my-0.5">{d.dayNum}</span>
                      <span className="text-[10px] text-neutral-400">{d.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots Grid */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                2. Selecione o Horário Disponível
              </label>
              {availableTimeSlots.length === 0 ? (
                <div className="p-6 text-center bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-400 text-sm">
                  Não há horários disponíveis para esta data. Por favor, selecione outro dia no calendário acima.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableTimeSlots.map((timeStr) => {
                    const isSelected = selectedTime === timeStr;
                    return (
                      <button
                        key={timeStr}
                        type="button"
                        onClick={() => setSelectedTime(timeStr)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border transition-all ${
                          isSelected
                            ? 'bg-white text-neutral-950 border-white font-bold shadow'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                disabled={!selectedTime}
                onClick={() => setStep(4)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedTime
                    ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Avançar para Seus Dados</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Customer Details & Payment */}
        {step === 4 && (
          <form onSubmit={handleFinishBooking} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Quase Pronto! Seus Dados</h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                Informe seus dados para receber o lembrete de confirmação no WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  WhatsApp com DDD *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-mono"
                  />
                </div>
              </div>

              {/* If Lava Rápido, ask for Vehicle details */}
              {activeBusinessType === 'carwash' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Modelo do Veículo & Cor *
                    </label>
                    <div className="relative">
                      <Car className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Honda Civic Preto"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Placa do Veículo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: ABC-1234"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 uppercase font-mono"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Observações adicionais (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Alguma preferência especial, formato de unha, corte desejado ou detalhe..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Forma de Pagamento Preferida
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'pix', label: 'Pix Instantâneo', icon: <QrCode className="w-4 h-4" /> },
                    { id: 'credit', label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'debit', label: 'Cartão de Débito', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'cash', label: 'Dinheiro no Local', icon: <CheckCircle2 className="w-4 h-4" /> },
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                      paymentMethod === pm.id
                        ? 'border-white bg-neutral-800 text-white font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {pm.icon}
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Review Box */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-neutral-200">Resumo do Agendamento:</div>
              <div className="flex justify-between text-neutral-400">
                <span>Data & Horário:</span>
                <span className="text-white font-mono font-medium">
                  {selectedDate.split('-').reverse().join('/')} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Serviços ({selectedServices.length}):</span>
                <span className="text-white font-medium">
                  {selectedServices.map((s) => s.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400 pt-2 border-t border-neutral-800">
                <span className="font-semibold text-neutral-200">Valor Total:</span>
                <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-all shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Agendamento</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Success / Confirmation Screen */}
        {step === 5 && confirmedAppointment && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Agendamento Realizado com Sucesso!</h2>
              <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
                Tudo pronto, <strong className="text-neutral-200">{confirmedAppointment.customerName}</strong>! Guardamos seu horário em nossa agenda.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="max-w-md mx-auto p-5 bg-neutral-950 border border-neutral-800 rounded-xl text-left space-y-3 text-xs shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="font-bold text-white text-sm">{businessConfig.name}</span>
                <span className="font-mono text-emerald-400 uppercase font-semibold">Confirmado</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-neutral-400">
                <div>
                  <span className="block text-[11px] text-neutral-500">Data</span>
                  <span className="text-white font-mono font-medium">
                    {confirmedAppointment.date.split('-').reverse().join('/')}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-neutral-500">Horário</span>
                  <span className="text-white font-mono font-medium">
                    {confirmedAppointment.time} ({confirmedAppointment.durationMinutes} min)
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[11px] text-neutral-500">Serviços</span>
                  <span className="text-white font-medium">
                    {confirmedAppointment.serviceIds
                      .map((id) => services.find((s) => s.id === id)?.name)
                      .join(', ')}
                  </span>
                </div>
                {confirmedAppointment.vehicleModel && (
                  <div className="col-span-2">
                    <span className="block text-[11px] text-neutral-500">Veículo</span>
                    <span className="text-white font-medium">
                      {confirmedAppointment.vehicleModel} ({confirmedAppointment.vehiclePlate || 'S/ Placa'})
                    </span>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-neutral-400">Total a pagar:</span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    R$ {confirmedAppointment.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Pix copy box if selected */}
            {confirmedAppointment.paymentMethod === 'pix' && (
              <div className="max-w-md mx-auto p-4 bg-emerald-950/20 border border-emerald-800/50 rounded-xl text-left">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    Chave Pix para Pagamento Antecipado
                  </span>
                  <span className="text-[10px] uppercase font-mono bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-200">
                    {businessConfig.pixKeyType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-200">
                  <span className="truncate">{businessConfig.pixKey}</span>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-sans font-medium shrink-0 transition-colors"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Ou pague diretamente na recepção no momento do atendimento.
                </p>
              </div>
            )}

            {/* WhatsApp Direct Confirmation Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = generateWhatsAppText(confirmedAppointment, 'confirmacao');
                  openWhatsApp(businessConfig.whatsapp, text);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow"
              >
                <span>Enviar Comprovante via WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  // Reset form for new appointment
                  setStep(1);
                  setSelectedServiceIds([]);
                  setSelectedTime('');
                  setConfirmedAppointmentId(null);
                }}
                className="w-full sm:w-auto px-4 py-3 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                Fazer Outro Agendamento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

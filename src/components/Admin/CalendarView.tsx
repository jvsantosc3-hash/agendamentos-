import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { AppointmentStatus } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Filter,
  Plus,
  MessageCircle,
  Car,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    activeBusinessType,
    appointments,
    services,
    professionals,
    updateAppointmentStatus,
    openWhatsApp,
    generateWhatsAppText,
    setIsQuickBookingModalOpen,
  } = useBusiness();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [selectedProfessionalFilter, setSelectedProfessionalFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Change date offset
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Filter appointments for the day
  const filteredDayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (apt.date !== selectedDate) return false;
      if (
        selectedProfessionalFilter !== 'all' &&
        apt.professionalId !== selectedProfessionalFilter
      ) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && apt.status !== selectedStatusFilter) {
        return false;
      }
      return true;
    });
  }, [appointments, selectedDate, selectedProfessionalFilter, selectedStatusFilter]);

  const getServiceNames = (ids: string[]) => {
    return ids
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getProfessional = (id: string) => {
    return professionals.find((p) => p.id === id);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="text-[10px] font-medium text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
            Agendado
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            Confirmado
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[10px] font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            Em Atendimento
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-medium text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
            Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] font-medium text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
            Cancelado
          </span>
        );
    }
  };

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedHeaderDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Date Bar & Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Dia Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono font-medium text-white focus:outline-none focus:border-neutral-500"
            />
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Próximo Dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700"
          >
            Hoje
          </button>

          <div className="hidden lg:block ml-2 text-sm font-semibold text-neutral-200 capitalize">
            {formattedHeaderDate}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Professional filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800 text-xs">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedProfessionalFilter}
              onChange={(e) => setSelectedProfessionalFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all" className="bg-neutral-900">
                Todos Profissionais
              </option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all" className="bg-neutral-900">
                Todos os Status
              </option>
              <option value="scheduled" className="bg-neutral-900">
                Agendados
              </option>
              <option value="confirmed" className="bg-neutral-900">
                Confirmados
              </option>
              <option value="in_progress" className="bg-neutral-900">
                Em Atendimento
              </option>
              <option value="completed" className="bg-neutral-900">
                Concluídos
              </option>
              <option value="cancelled" className="bg-neutral-900">
                Cancelados
              </option>
            </select>
          </div>

          <button
            onClick={() => setIsQuickBookingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Daily Timeline Schedule */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            <span>Agenda do Dia</span>
            <span className="text-xs font-mono font-normal text-neutral-400">
              ({filteredDayAppointments.length} agendamentos listados)
            </span>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            {selectedDate.split('-').reverse().join('/')}
          </div>
        </div>

        {filteredDayAppointments.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-xs">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p>Nenhum agendamento encontrado para os filtros selecionados nesta data.</p>
            <button
              onClick={() => setIsQuickBookingModalOpen(true)}
              className="mt-3 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Criar Agendamento neste dia
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredDayAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((apt) => {
                const prof = getProfessional(apt.professionalId);
                const srvText = getServiceNames(apt.serviceIds);

                return (
                  <div
                    key={apt.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-850/40 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Time Block */}
                      <div className="w-20 text-center py-2.5 px-1 bg-neutral-950 rounded-xl border border-neutral-800 shrink-0">
                        <span className="font-mono text-base font-bold text-white block">
                          {apt.time}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          {apt.durationMinutes} min
                        </span>
                      </div>

                      {/* Content Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-sm">
                            {apt.customerName}
                          </h3>
                          {getStatusBadge(apt.status)}
                          <span className="text-xs text-neutral-500 font-mono">
                            {apt.customerPhone}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-300 mt-1">
                          <strong className="text-neutral-400 font-normal">Serviços:</strong> {srvText}
                        </div>

                        {apt.vehicleModel && (
                          <div className="text-xs text-cyan-400 mt-0.5 flex items-center gap-1 font-mono">
                            <Car className="w-3.5 h-3.5" />
                            <span>{apt.vehicleModel}</span>
                            {apt.vehiclePlate && <span>· Placa {apt.vehiclePlate}</span>}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-neutral-500" />
                            <span>{prof?.name || 'Profissional não definido'}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-bold text-white">
                            R$ {apt.totalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[11px] uppercase font-mono text-neutral-400">
                            {apt.paymentMethod} ({apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente'})
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-[11px] text-amber-300/80 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30 mt-2 inline-block">
                            Obs: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick status switch dropdown & WhatsApp trigger */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                      <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
                        <span className="text-[11px] text-neutral-500 px-1">Status:</span>
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)
                          }
                          className="bg-transparent text-white focus:outline-none text-xs font-medium cursor-pointer"
                        >
                          <option value="scheduled" className="bg-neutral-900">
                            Agendado
                          </option>
                          <option value="confirmed" className="bg-neutral-900">
                            Confirmado
                          </option>
                          <option value="in_progress" className="bg-neutral-900">
                            Em Atendimento
                          </option>
                          <option value="completed" className="bg-neutral-900">
                            Concluído & Pago
                          </option>
                          <option value="cancelled" className="bg-neutral-900">
                            Cancelado
                          </option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const text = generateWhatsAppText(apt, 'confirmacao');
                          openWhatsApp(apt.customerPhone, text);
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1"
                        title="Enviar confirmação no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Zap</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

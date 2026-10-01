import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Play,
  XCircle,
  MessageCircle,
  Plus,
  Car,
  Sparkles,
  Scissors,
  AlertCircle,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    activeBusinessType,
    businessConfig,
    appointments,
    services,
    professionals,
    updateAppointmentStatus,
    openWhatsApp,
    generateWhatsAppText,
    setAdminTab,
    setIsQuickBookingModalOpen,
  } = useBusiness();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's appointments
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  // Financial calculations for today
  const revenueToday = todayAppointments
    .filter((a) => a.paymentStatus === 'paid' && a.status !== 'cancelled')
    .reduce((acc, a) => acc + a.totalPrice, 0);

  const pendingRevenueToday = todayAppointments
    .filter((a) => a.paymentStatus === 'pending' && a.status !== 'cancelled')
    .reduce((acc, a) => acc + a.totalPrice, 0);

  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;
  const inProgressToday = todayAppointments.filter((a) => a.status === 'in_progress').length;
  const scheduledToday = todayAppointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length;

  const averageTicket =
    todayAppointments.length > 0
      ? (revenueToday + pendingRevenueToday) / todayAppointments.length
      : 0;

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getProfessional = (profId: string) => {
    return professionals.find((p) => p.id === profId);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="text-[11px] font-medium text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
            Agendado
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            Confirmado
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[11px] font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 animate-pulse">
            Em Atendimento
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] font-medium text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
            Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-medium text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase font-mono tracking-wider">
            <span>Visão Operacional</span>
            <span aria-hidden="true">·</span>
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Painel de Controle · {businessConfig.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gerencie o fluxo de clientes, horários da equipe e envie lembretes via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickBookingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Agendamento Balcão</span>
          </button>
          <button
            onClick={() => setAdminTab('calendar')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Agenda</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Faturamento Hoje */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Faturamento Hoje</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            R$ {revenueToday.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            + R$ {pendingRevenueToday.toFixed(2).replace('.', ',')} a receber
          </div>
        </div>

        {/* Card 2: Agendamentos Hoje */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Agendamentos Hoje</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {todayAppointments.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {scheduledToday} aguardando · {inProgressToday} em atendimento
          </div>
        </div>

        {/* Card 3: Finalizados com Sucesso */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Concluídos Hoje</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {completedToday}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {todayAppointments.length > 0
              ? `${Math.round((completedToday / todayAppointments.length) * 100)}% do dia finalizado`
              : 'Nenhum agendamento'}
          </div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            R$ {averageTicket.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Média por cliente atendido
          </div>
        </div>
      </div>

      {/* Main Content: Atendimentos de Hoje */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Fluxo de Atendimentos de Hoje</span>
              <span className="text-xs font-mono font-normal bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                {todayAppointments.length} agendados
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Atualize o status dos clientes com 1 clique e envie avisos no WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('whatsapp')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Central de Mensagens</span>
            </button>
          </div>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sm">
            <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p>Não há agendamentos cadastrados para o dia de hoje.</p>
            <button
              onClick={() => setIsQuickBookingModalOpen(true)}
              className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Criar Primeiro Agendamento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {todayAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((apt) => {
                const prof = getProfessional(apt.professionalId);
                const srvText = getServiceNames(apt.serviceIds);

                return (
                  <div
                    key={apt.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-850/50 transition-colors px-2 rounded-lg"
                  >
                    {/* Time & Client details */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 text-center py-2 px-1 bg-neutral-950 rounded-lg border border-neutral-800 shrink-0">
                        <div className="font-mono text-sm font-bold text-white">{apt.time}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {apt.durationMinutes} min
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">
                            {apt.customerName}
                          </span>
                          {getStatusBadge(apt.status)}
                          <span className="text-xs text-neutral-500 font-mono">
                            {apt.customerPhone}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-300 mt-1">
                          <strong className="text-neutral-400 font-normal">Serviço:</strong> {srvText}
                        </div>

                        {/* If carwash vehicle details */}
                        {apt.vehicleModel && (
                          <div className="text-xs text-cyan-400/90 mt-0.5 flex items-center gap-1 font-mono">
                            <Car className="w-3.5 h-3.5" />
                            <span>{apt.vehicleModel}</span>
                            {apt.vehiclePlate && <span>· Placa {apt.vehiclePlate}</span>}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1">
                          <span>
                            Profissional: <strong className="text-neutral-300">{prof?.name || 'Equipe'}</strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-semibold text-white">
                            R$ {apt.totalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="uppercase text-[10px] text-neutral-400 font-mono">
                            {apt.paymentMethod} ({apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente'})
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-[11px] text-amber-400/80 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40 mt-1.5 inline-block">
                            Obs: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                          className="px-2.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmar</span>
                        </button>
                      )}

                      {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                          className="px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar</span>
                        </button>
                      )}

                      {apt.status === 'in_progress' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed', 'paid')}
                          className="px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finalizar & Baixar</span>
                        </button>
                      )}

                      {/* WhatsApp Fast trigger */}
                      <button
                        onClick={() => {
                          const text =
                            activeBusinessType === 'carwash' && apt.status === 'in_progress'
                              ? generateWhatsAppText(apt, 'pronto')
                              : generateWhatsAppText(apt, 'lembrete');
                          openWhatsApp(apt.customerPhone, text);
                        }}
                        title="Enviar mensagem no WhatsApp do cliente"
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Zap</span>
                      </button>

                      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                          title="Cancelar Agendamento"
                          className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Domain specific operational highlight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeBusinessType === 'manicure' && (
          <>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase font-mono mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Esterilização & Autoclave</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Ciclo do autoclave matinal validado com indicador biológico. Envelopes cirúrgicos individuais lacrados e prontos para uso.
              </p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase font-mono mb-2">
                <Clock className="w-4 h-4" />
                <span>Duração Média de Mesa</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Média de 90min para alongamentos e 50min para combos tradicionais. Intervalo de 15min para higienização entre clientes.
              </p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase font-mono mb-2">
                <Users className="w-4 h-4" />
                <span>Profissionais em Atendimento</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {professionals.filter((p) => p.active).length} nail designers ativas na escala de hoje.
              </p>
            </div>
          </>
        )}

        {activeBusinessType === 'barber' && (
          <>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase font-mono mb-2">
                <Scissors className="w-4 h-4" />
                <span>Cadeiras Operacionais</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {professionals.length} cadeiras ativas hoje. Lâminas descartáveis novas conferidas em bancada.
              </p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase font-mono mb-2">
                <Clock className="w-4 h-4" />
                <span>Tempo Médio por Cadeira</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                45 minutos por corte degradê / 35 minutos para barba terapia com toalha quente e massagem.
              </p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase font-mono mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Comissão dos Barbeiros</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Relatório de comissões atualizado automaticamente na aba Financeiro ao concluir cada corte.
              </p>
            </div>
          </>
        )}

        {activeBusinessType === 'carwash' && (
          <>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase font-mono mb-2">
                <Car className="w-4 h-4" />
                <span>Veículos no Pátio</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Capacidade para até 6 veículos simultâneos em boxes de lavagem, secagem e polimento técnico.
              </p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase font-mono mb-2">
                <MessageCircle className="w-4 h-4" />
                <span>Aviso de Carro Pronto</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Envie o aviso automático no WhatsApp quando a higienização ou lavagem for finalizada para liberação rápida da vaga.
              </p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase font-mono mb-2">
                <Clock className="w-4 h-4" />
                <span>Fila da Ducha Express</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Tempo médio de 30 minutos para lavagem simples de compactos e sedans.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { MessageCircle, Copy, ExternalLink, Check, Clock, User, Sparkles, Car } from 'lucide-react';

export const WhatsAppCenter: React.FC = () => {
  const {
    activeBusinessType,
    appointments,
    services,
    professionals,
    businessConfig,
    generateWhatsAppText,
    openWhatsApp,
  } = useBusiness();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(() => {
    return appointments.length > 0 ? appointments[0].id : '';
  });

  const [selectedTemplate, setSelectedTemplate] = useState<
    'confirmacao' | 'lembrete' | 'pos_atendimento' | 'pronto'
  >('confirmacao');

  const [copied, setCopied] = useState(false);

  const selectedAppointment = useMemo(() => {
    return appointments.find((a) => a.id === selectedAppointmentId) || appointments[0] || null;
  }, [appointments, selectedAppointmentId]);

  const generatedMessage = useMemo(() => {
    if (!selectedAppointment) return '';
    return generateWhatsAppText(selectedAppointment, selectedTemplate);
  }, [selectedAppointment, selectedTemplate, generateWhatsAppText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    if (!selectedAppointment) return;
    openWhatsApp(selectedAppointment.customerPhone, generatedMessage);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Central de Lembretes & Mensagens WhatsApp</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Automatize a confirmação de agendamentos, reduza no-shows (faltas) e fidelize clientes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Appointment & Template */}
        <div className="lg:col-span-5 space-y-4">
          {/* Appointment Selector */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              1. Selecione o Agendamento
            </label>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {appointments.length === 0 ? (
                <div className="text-neutral-500 text-xs py-4 text-center">
                  Nenhum agendamento disponível.
                </div>
              ) : (
                appointments.map((apt) => {
                  const isSelected = apt.id === selectedAppointment?.id;
                  const srv = apt.serviceIds
                    .map((id) => services.find((s) => s.id === id)?.name)
                    .join(', ');

                  return (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointmentId(apt.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/20 text-white'
                          : 'border-neutral-850 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white">{apt.customerName}</span>
                        <span className="font-mono text-emerald-400">
                          {apt.date.split('-').reverse().join('/')} · {apt.time}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate mt-0.5">{srv}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-1">
                        {apt.customerPhone}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Template Selector */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              2. Escolha o Modelo de Mensagem
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate('confirmacao')}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  selectedTemplate === 'confirmacao'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-white mb-0.5">Confirmação</div>
                <div className="text-[11px] text-neutral-500">
                  Data, hora, serviços e chave Pix
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('lembrete')}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  selectedTemplate === 'lembrete'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-white mb-0.5">Lembrete do Dia</div>
                <div className="text-[11px] text-neutral-500">
                  Aviso para evitar faltas
                </div>
              </button>

              {activeBusinessType === 'carwash' && (
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('pronto')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    selectedTemplate === 'pronto'
                      ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-medium text-white mb-0.5">Carro Pronto</div>
                  <div className="text-[11px] text-neutral-500">
                    Aviso de liberação do veículo
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedTemplate('pos_atendimento')}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  selectedTemplate === 'pos_atendimento'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-white mb-0.5">Pós-Atendimento</div>
                <div className="text-[11px] text-neutral-500">
                  Pesquisa de satisfação & volta
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Simulator Preview & Actions */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between shadow">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Simulador de Mensagem WhatsApp
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pronto para envio
              </span>
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="bg-[#0b141a] p-4 rounded-xl border border-neutral-800 min-h-[260px] flex flex-col justify-end">
              <div className="bg-[#005c4b] text-neutral-100 p-4 rounded-xl rounded-tr-none text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed shadow-md max-w-lg self-end">
                {generatedMessage || 'Selecione um agendamento para pré-visualizar a mensagem.'}
                <div className="text-[10px] text-emerald-200 text-right mt-2 font-mono">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-750 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Texto Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleSend}
              disabled={!selectedAppointment}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-neutral-950" />
              <span>Abrir WhatsApp do Cliente</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

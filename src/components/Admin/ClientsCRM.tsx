import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { CustomerHistory } from '../../types';
import { Search, Phone, MessageCircle, Calendar, DollarSign, Car, User, Clock } from 'lucide-react';

export const ClientsCRM: React.FC = () => {
  const { customers, appointments, services, openWhatsApp, businessConfig } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerHistory | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.vehicleInfo && c.vehicleInfo.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const customerAppointments = useMemo(() => {
    if (!selectedCustomer) return [];
    return appointments.filter(
      (a) =>
        a.customerPhone === selectedCustomer.phone ||
        a.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [appointments, selectedCustomer]);

  const handleSendWhatsAppLoyalty = (customer: CustomerHistory) => {
    const text =
      `Olá, *${customer.name}*! Tudo bem?\n\n` +
      `Aqui é da equipe *${businessConfig.name}*. Faz um tempinho desde a sua última visita em ${customer.lastVisitDate.split('-').reverse().join('/')}.\n\n` +
      `Passando para saber como você está e avisar que temos novos horários livres para esta semana! Deseja renovar seu agendamento?\n\n` +
      `Aguardamos sua resposta!`;
    openWhatsApp(customer.phone, text);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Base de Clientes & CRM</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Histórico completo de visitas, ticket acumulado e contato direto via WhatsApp.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, fone, placa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4 text-center">Visitas</th>
                <th className="py-3 px-4 text-right">Total Gasto</th>
                <th className="py-3 px-4">Última Visita</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                    Nenhum cliente encontrado com os critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.phone} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      {c.vehicleInfo && (
                        <div className="text-[11px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span>{c.vehicleInfo}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {c.phone}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white tabular-nums">
                      {c.totalAppointments}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      R$ {c.totalSpent.toFixed(2).replace('.', ',')}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                      {c.lastVisitDate ? c.lastVisitDate.split('-').reverse().join('/') : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
                        >
                          Histórico
                        </button>
                        <button
                          onClick={() => handleSendWhatsAppLoyalty(c)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-md transition-colors flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Zap</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-white">{selectedCustomer.name}</h2>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  {selectedCustomer.phone}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                  Total Acumulado
                </span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  R$ {selectedCustomer.totalSpent.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-3">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Histórico de Atendimentos ({customerAppointments.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {customerAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 bg-neutral-950 border border-neutral-850 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-neutral-400">
                      <span className="font-mono text-white font-medium">
                        {apt.date.split('-').reverse().join('/')} às {apt.time}
                      </span>
                      <span className="font-mono font-bold text-white">
                        R$ {apt.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="text-neutral-300">
                      {apt.serviceIds
                        .map((id) => services.find((s) => s.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                    {apt.vehicleModel && (
                      <div className="text-cyan-400 text-[11px] font-mono">
                        {apt.vehicleModel} ({apt.vehiclePlate || 'S/P'})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

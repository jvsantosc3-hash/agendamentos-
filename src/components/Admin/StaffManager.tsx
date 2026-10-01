import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Professional } from '../../types';
import { User, Plus, Edit2, Trash2, Phone, Star, DollarSign, Clock, Calendar } from 'lucide-react';

export const StaffManager: React.FC = () => {
  const { professionals, appointments, addProfessional, updateProfessional, deleteProfessional } =
    useBusiness();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [commissionPercent, setCommissionPercent] = useState(50);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('19:00');

  const handleOpenAdd = () => {
    setEditingProf(null);
    setName('');
    setRole('');
    setPhone('');
    setBio('');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80');
    setCommissionPercent(50);
    setStartTime('09:00');
    setEndTime('19:00');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Professional) => {
    setEditingProf(p);
    setName(p.name);
    setRole(p.role);
    setPhone(p.phone);
    setBio(p.bio);
    setAvatar(p.avatar);
    setCommissionPercent(Math.round(p.commissionRate * 100));
    setStartTime(p.startTime);
    setEndTime(p.endTime);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProf) {
      updateProfessional({
        ...editingProf,
        name,
        role,
        phone,
        bio,
        avatar,
        commissionRate: commissionPercent / 100,
        startTime,
        endTime,
      });
    } else {
      addProfessional({
        name,
        role,
        phone,
        bio,
        avatar,
        rating: 5.0,
        commissionRate: commissionPercent / 100,
        workingDays: [1, 2, 3, 4, 5, 6],
        startTime,
        endTime,
        active: true,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Equipe & Profissionais</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cadastre os membros da equipe, horários de expediente e porcentagens de comissão por serviço.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Profissional</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map((prof) => {
          // Calculate appointments & commissions for this professional
          const profAppointments = appointments.filter((a) => a.professionalId === prof.id);
          const totalRevenue = profAppointments
            .filter((a) => a.status === 'completed' || a.paymentStatus === 'paid')
            .reduce((acc, a) => acc + a.totalPrice, 0);
          const totalCommission = totalRevenue * prof.commissionRate;

          return (
            <div
              key={prof.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{prof.name}</span>
                        {!prof.active && (
                          <span className="text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.2 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">{prof.role}</div>
                      <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5 font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{prof.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(prof)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover o profissional "${prof.name}"?`)) {
                          deleteProfessional(prof.id);
                        }
                      }}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
                  {prof.bio || 'Sem descrição cadastrada.'}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      Telefone / WhatsApp:
                    </span>
                    <span className="text-white font-mono">{prof.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      Expediente:
                    </span>
                    <span className="text-white font-mono">
                      {prof.startTime} às {prof.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      Taxa de Comissão:
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {Math.round(prof.commissionRate * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance snapshot */}
              <div className="mt-4 pt-3 border-t border-neutral-800 bg-neutral-950/60 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">
                    Total Atendimentos
                  </div>
                  <div className="font-mono font-bold text-white text-sm">
                    {profAppointments.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">
                    Comissão a Pagar
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                    R$ {totalCommission.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {editingProf ? 'Editar Profissional' : 'Novo Membro da Equipe'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Camila Rocha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Especialidade / Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Barbeiro Sênior, Nail Designer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Comissão (%) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Entrada
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Saída
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Mini Bio / Apresentação
                </label>
                <textarea
                  rows={2}
                  placeholder="Destaque as especialidades e anos de experiência..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-neutral-950 hover:bg-neutral-100 rounded-lg text-xs font-bold shadow"
                >
                  Salvar Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

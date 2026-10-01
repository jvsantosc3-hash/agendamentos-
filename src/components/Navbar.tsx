import React from 'react';
import { useBusiness, AdminTab } from '../context/BusinessContext';
import { BusinessType } from '../types';
import {
  Calendar,
  Sparkles,
  Scissors,
  Car,
  Clock,
  Users,
  DollarSign,
  MessageCircle,
  Plus,
  LayoutDashboard,
  Store,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeBusinessType,
    setActiveBusinessType,
    activeView,
    setActiveView,
    adminTab,
    setAdminTab,
    businessConfig,
    setIsQuickBookingModalOpen,
  } = useBusiness();

  const businessTypes: { type: BusinessType; label: string; icon: React.ReactNode }[] = [
    { type: 'manicure', label: 'Manicure & Nails', icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
    { type: 'barber', label: 'Barbearia & Fade', icon: <Scissors className="w-4 h-4 text-amber-400" /> },
    { type: 'carwash', label: 'Lava Rápido & Auto', icon: <Car className="w-4 h-4 text-cyan-400" /> },
  ];

  const adminNavLinks: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'calendar', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
    { id: 'services', label: 'Serviços & Preços', icon: <Clock className="w-4 h-4" /> },
    { id: 'staff', label: 'Profissionais', icon: <Users className="w-4 h-4" /> },
    { id: 'clients', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'financial', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'Mensagens WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'settings', label: 'Ajustes', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      {/* Niche quick selector strip */}
      <div className="bg-neutral-950 border-b border-neutral-850 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-neutral-500 font-medium hidden sm:inline">Ramo Ativo:</span>
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
            {businessTypes.map((item) => {
              const isActive = activeBusinessType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setActiveBusinessType(item.type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View toggle (Portal vs Admin) */}
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveView('portal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeView === 'portal'
                ? 'bg-white text-neutral-950 font-semibold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Portal do Cliente</span>
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeView === 'admin'
                ? 'bg-neutral-700 text-white font-semibold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Painel do Dono (Admin)</span>
          </button>
        </div>
      </div>

      {/* Main Bar complying with Top Bar Contract: Zone 1 (Brand), Zone 2 (Nav links), Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            if (activeView === 'admin') setAdminTab('dashboard');
          }}
          className="text-left flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
            {businessConfig.name}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
            {activeBusinessType === 'manicure'
              ? 'Nails'
              : activeBusinessType === 'barber'
              ? 'Barber'
              : 'Auto Detailing'}
          </span>
        </button>

        {/* Zone 2: Navigation Links (Contextual to Admin or Portal) */}
        {activeView === 'admin' ? (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium overflow-x-auto py-1">
            {adminNavLinks.map((item) => {
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <span className="text-xs text-neutral-400">
              📍 {businessConfig.address} · {businessConfig.city}
            </span>
          </nav>
        )}

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {activeView === 'admin' ? (
            <button
              onClick={() => setIsQuickBookingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Agendamento</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const el = document.getElementById('booking-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-white hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shadow"
            >
              <span>Agendar Agora</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar for Admin mobile tabs */}
      {activeView === 'admin' && (
        <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-neutral-900 border-t border-neutral-800 overflow-x-auto text-xs">
          {adminNavLinks.map((item) => {
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

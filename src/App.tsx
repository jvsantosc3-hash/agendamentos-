import React from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Navbar } from './components/Navbar';
import { BookingPortal } from './components/PortalCliente/BookingPortal';
import { DashboardOverview } from './components/Admin/DashboardOverview';
import { CalendarView } from './components/Admin/CalendarView';
import { ServicesManager } from './components/Admin/ServicesManager';
import { StaffManager } from './components/Admin/StaffManager';
import { ClientsCRM } from './components/Admin/ClientsCRM';
import { FinancialReports } from './components/Admin/FinancialReports';
import { WhatsAppCenter } from './components/Admin/WhatsAppCenter';
import { SettingsManager } from './components/Admin/SettingsManager';
import { QuickBookingModal } from './components/Admin/QuickBookingModal';
import { Sparkles, Scissors, Car, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, adminTab, businessConfig, activeBusinessType } = useBusiness();

  const renderAdminTab = () => {
    switch (adminTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'calendar':
        return <CalendarView />;
      case 'services':
        return <ServicesManager />;
      case 'staff':
        return <StaffManager />;
      case 'clients':
        return <ClientsCRM />;
      case 'financial':
        return <FinancialReports />;
      case 'whatsapp':
        return <WhatsAppCenter />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeView === 'portal' ? (
          <div id="booking-section">
            <BookingPortal />
          </div>
        ) : (
          renderAdminTab()
        )}
      </main>

      <QuickBookingModal />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 text-neutral-500 text-xs py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">
              {businessConfig.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>Sistema Multi-Ramos (Manicure, Barbearia e Lava Rápido)</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5" />
              {businessConfig.phone}
            </span>
            <span aria-hidden="true">·</span>
            <span>{businessConfig.address}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BusinessProvider>
      <MainContent />
    </BusinessProvider>
  );
}

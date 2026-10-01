import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { VehicleCategory } from '../../types';
import { X, Calendar, Clock, User, Phone, CheckCircle2, DollarSign, Car } from 'lucide-react';

export const QuickBookingModal: React.FC = () => {
  const {
    activeBusinessType,
    services,
    professionals,
    createAppointment,
    isQuickBookingModalOpen,
    setIsQuickBookingModalOpen,
    openWhatsApp,
    generateWhatsAppText,
  } = useBusiness();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(
    services.length > 0 ? services[0].id : ''
  );
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(
    professionals.length > 0 ? professionals[0].id : ''
  );
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('hatch');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [notes, setNotes] = useState('');
  const [sendWhatsAppImmediate, setSendWhatsAppImmediate] = useState(true);

  if (!isQuickBookingModalOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const servicePrice =
    activeBusinessType === 'carwash' && currentService?.vehiclePricing
      ? currentService.vehiclePricing[vehicleCategory] ?? currentService.price
      : currentService?.price || 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !currentService) return;

    const apt = createAppointment({
      businessType: activeBusinessType,
      customerName,
      customerPhone,
      serviceIds: [currentService.id],
      professionalId: selectedProfessionalId || professionals[0]?.id || 'p-1',
      date,
      time,
      durationMinutes: currentService.durationMinutes,
      totalPrice: servicePrice,
      status: 'confirmed',
      paymentMethod: 'pix',
      paymentStatus: 'pending',
      notes: notes || undefined,
      vehicleCategory: activeBusinessType === 'carwash' ? vehicleCategory : undefined,
      vehicleModel: activeBusinessType === 'carwash' ? vehicleModel : undefined,
      vehiclePlate: activeBusinessType === 'carwash' ? vehiclePlate.toUpperCase() : undefined,
    });

    if (sendWhatsAppImmediate) {
      const msg = generateWhatsAppText(apt, 'confirmacao');
      openWhatsApp(customerPhone, msg);
    }

    setIsQuickBookingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={() => setIsQuickBookingModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Novo Agendamento Rápido (Balcão)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cadastre agendamentos recebidos por ligação, WhatsApp ou cliente presencial.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Roberto Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                WhatsApp com DDD *
              </label>
              <input
                type="tel"
                required
                placeholder="(11) 98765-4321"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          {activeBusinessType === 'carwash' && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-neutral-300 font-medium mb-1">
                  Categoria
                </label>
                <select
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                  className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white"
                >
                  <option value="hatch">Hatch</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="moto">Moto</option>
                </select>
              </div>

              <div className="col-span-3 sm:col-span-1">
                <label className="block text-neutral-300 font-medium mb-1">
                  Modelo do Carro
                </label>
                <input
                  type="text"
                  placeholder="Ex: Onix Prata"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white"
                />
              </div>

              <div className="col-span-3 sm:col-span-1">
                <label className="block text-neutral-300 font-medium mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  placeholder="ABC-1234"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white uppercase font-mono"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Serviço *
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:border-neutral-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - R${s.price} ({s.durationMinutes}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Profissional *
              </label>
              <select
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:border-neutral-500"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Horário *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Pediu para ligar antes, cliente com pressa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <span className="text-neutral-400">Total a Pagar:</span>
              <span className="ml-2 font-mono font-bold text-white text-sm">
                R$ {servicePrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-emerald-400 font-medium">
              <input
                type="checkbox"
                checked={sendWhatsAppImmediate}
                onChange={(e) => setSendWhatsAppImmediate(e.target.checked)}
                className="rounded bg-neutral-900 border-neutral-700"
              />
              <span>Enviar comprovante no Zap ao salvar</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsQuickBookingModalOpen(false)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-lg text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs shadow"
            >
              Criar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

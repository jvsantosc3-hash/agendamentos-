import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Settings, Save, RotateCcw, Check, QrCode, Store, Clock } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { businessConfig, updateBusinessConfig, resetToInitialData } = useBusiness();

  const [name, setName] = useState(businessConfig.name);
  const [tagline, setTagline] = useState(businessConfig.tagline);
  const [address, setAddress] = useState(businessConfig.address);
  const [neighborhood, setNeighborhood] = useState(businessConfig.neighborhood);
  const [phone, setPhone] = useState(businessConfig.phone);
  const [whatsapp, setWhatsapp] = useState(businessConfig.whatsapp);
  const [pixKey, setPixKey] = useState(businessConfig.pixKey);
  const [pixKeyType, setPixKeyType] = useState(businessConfig.pixKeyType);
  const [openingTime, setOpeningTime] = useState(businessConfig.openingTime);
  const [closingTime, setClosingTime] = useState(businessConfig.closingTime);
  const [cancellationPolicy, setCancellationPolicy] = useState(businessConfig.cancellationPolicy);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig({
      name,
      tagline,
      address,
      neighborhood,
      phone,
      whatsapp,
      pixKey,
      pixKeyType,
      openingTime,
      closingTime,
      cancellationPolicy,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar os dados de exemplo para todos os 3 ramos (Manicure, Barbearia, Lava Rápido)?'
      )
    ) {
      resetToInitialData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Configurações do Estabelecimento</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dados exibidos para os clientes no portal online e comprovantes de agendamento.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/60 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Dados Originais de Teste</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-neutral-400" />
            <span>Informações Principais</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Nome Comercial do Estabelecimento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Slogan / Especialidade
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Bairro & Cidade
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Telefone de Contato
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                WhatsApp Comercial (somente dígitos com DDD)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Dados de Recebimento Pix</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Tipo de Chave Pix
              </label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="telefone">Celular</option>
                <option value="email">E-mail</option>
                <option value="aleatoria">Chave Aleatória</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Chave Pix Copia e Cola
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Horários de Funcionamento</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Abertura
              </label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Fechamento
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-neutral-300 font-medium mb-1">
                Política de Cancelamento / Reagendamento
              </label>
              <input
                type="text"
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {saved && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Configurações salvas com sucesso!
            </span>
          )}
          {!saved && <div />}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-neutral-950 hover:bg-neutral-100 rounded-lg text-xs font-bold shadow transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Service } from '../../types';
import { Clock, Plus, Edit2, Trash2, Check, Star, Car } from 'lucide-react';

export const ServicesManager: React.FC = () => {
  const { activeBusinessType, services, addService, updateService, deleteService } = useBusiness();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [price, setPrice] = useState(60);
  const [category, setCategory] = useState('');
  const [popular, setPopular] = useState(false);

  // Carwash specific vehicle prices
  const [priceHatch, setPriceHatch] = useState(60);
  const [priceSedan, setPriceSedan] = useState(70);
  const [priceSuv, setPriceSuv] = useState(85);
  const [priceMoto, setPriceMoto] = useState(45);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(45);
    setPrice(60);
    setCategory(categories[0] || 'Geral');
    setPopular(false);
    setPriceHatch(60);
    setPriceSedan(70);
    setPriceSuv(85);
    setPriceMoto(45);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setDescription(s.description);
    setDurationMinutes(s.durationMinutes);
    setPrice(s.price);
    setCategory(s.category);
    setPopular(!!s.popular);
    if (s.vehiclePricing) {
      setPriceHatch(s.vehiclePricing.hatch ?? s.price);
      setPriceSedan(s.vehiclePricing.sedan ?? s.price);
      setPriceSuv(s.vehiclePricing.suv ?? s.price);
      setPriceMoto(s.vehiclePricing.moto ?? s.price);
    } else {
      setPriceHatch(s.price);
      setPriceSedan(s.price);
      setPriceSuv(s.price);
      setPriceMoto(s.price);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const vehiclePricing =
      activeBusinessType === 'carwash'
        ? {
            moto: priceMoto,
            hatch: priceHatch,
            sedan: priceSedan,
            suv: priceSuv,
          }
        : undefined;

    if (editingService) {
      updateService({
        ...editingService,
        name,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        category: category.trim() || 'Geral',
        popular,
        vehiclePricing,
      });
    } else {
      addService({
        name,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        category: category.trim() || 'Geral',
        popular,
        vehiclePricing,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Catálogo de Serviços & Tabela de Preços</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure os procedimentos oferecidos, tempos de atendimento e valores cobrados.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-neutral-100 text-neutral-950 font-semibold'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          Todas as Categorias ({services.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-neutral-100 text-neutral-950 font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services List Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Nome do Serviço</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Duração</th>
                <th className="py-3 px-4 text-right">Preço Base</th>
                {activeBusinessType === 'carwash' && (
                  <th className="py-3 px-4 text-center">Tabela por Veículo</th>
                )}
                <th className="py-3 px-4 text-center">Destaque</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{s.name}</div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {s.description}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-300">
                    <span className="bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                      {s.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-300 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {s.durationMinutes} min
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                    R$ {s.price.toFixed(2).replace('.', ',')}
                  </td>

                  {activeBusinessType === 'carwash' && (
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-neutral-400">
                      {s.vehiclePricing ? (
                        <span>
                          H: R${s.vehiclePricing.hatch || s.price} · S: R${s.vehiclePricing.sedan || s.price} · SUV: R${s.vehiclePricing.suv || s.price}
                        </span>
                      ) : (
                        <span>Preço Único</span>
                      )}
                    </td>
                  )}

                  <td className="py-3.5 px-4 text-center">
                    {s.popular && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-400" />
                        Popular
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                        title="Editar Serviço"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o serviço "${s.name}"?`)) {
                            deleteService(s.id);
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
                        title="Remover Serviço"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banho de Verniz, Corte Navalhado, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique os benefícios e produtos utilizados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cabelo, Alongamentos, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Duração Estimada (minutos) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Preço Base (R$) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-500 text-sm font-mono"
                />
              </div>

              {/* Carwash vehicle specific overrides */}
              {activeBusinessType === 'carwash' && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    Preços Diferenciados por Veículo (R$)
                  </div>
                  <div className="grid grid-cols-4 gap-2 font-mono">
                    <div>
                      <span className="block text-[10px] text-neutral-400">Moto</span>
                      <input
                        type="number"
                        value={priceMoto}
                        onChange={(e) => setPriceMoto(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-400">Hatch</span>
                      <input
                        type="number"
                        value={priceHatch}
                        onChange={(e) => setPriceHatch(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-400">Sedan</span>
                      <input
                        type="number"
                        value={priceSedan}
                        onChange={(e) => setPriceSedan(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-400">SUV / Picape</span>
                      <input
                        type="number"
                        value={priceSuv}
                        onChange={(e) => setPriceSuv(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pop"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-800 text-white"
                />
                <label htmlFor="pop" className="text-neutral-300 cursor-pointer">
                  Marcar como serviço Mais Popular / Recomendado
                </label>
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
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DollarSign, TrendingUp, Users, Download, CreditCard, QrCode, Wallet, CheckCircle2 } from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { appointments, professionals, services, businessConfig } = useBusiness();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (a.status === 'cancelled') return false;
      if (dateFilter === 'today') return a.date === todayStr;
      if (dateFilter === 'month') return a.date.startsWith(currentMonthPrefix);
      return true;
    });
  }, [appointments, dateFilter, todayStr, currentMonthPrefix]);

  // Overall sums
  const totalGrossRevenue = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.paymentStatus === 'paid' || a.status === 'completed')
      .reduce((acc, a) => acc + a.totalPrice, 0);
  }, [filteredAppointments]);

  const pendingRevenue = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.paymentStatus === 'pending' && a.status !== 'completed')
      .reduce((acc, a) => acc + a.totalPrice, 0);
  }, [filteredAppointments]);

  // Commissions per professional
  const commissionSummary = useMemo(() => {
    return professionals.map((prof) => {
      const profApts = filteredAppointments.filter(
        (a) =>
          a.professionalId === prof.id &&
          (a.paymentStatus === 'paid' || a.status === 'completed')
      );
      const gross = profApts.reduce((acc, a) => acc + a.totalPrice, 0);
      const commission = gross * prof.commissionRate;
      const houseShare = gross - commission;

      return {
        id: prof.id,
        name: prof.name,
        role: prof.role,
        commissionRate: prof.commissionRate,
        appointmentsCount: profApts.length,
        grossGenerated: gross,
        commissionOwed: commission,
        houseShare,
      };
    });
  }, [professionals, filteredAppointments]);

  const totalCommissionsOwed = useMemo(() => {
    return commissionSummary.reduce((acc, c) => acc + c.commissionOwed, 0);
  }, [commissionSummary]);

  const netHouseProfit = totalGrossRevenue - totalCommissionsOwed;

  // Breakdown by payment method
  const paymentBreakdown = useMemo(() => {
    const methods: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      credit: { count: 0, total: 0 },
      debit: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
    };

    filteredAppointments.forEach((a) => {
      if (a.paymentStatus === 'paid' || a.status === 'completed') {
        const method = a.paymentMethod || 'cash';
        if (!methods[method]) methods[method] = { count: 0, total: 0 };
        methods[method].count += 1;
        methods[method].total += a.totalPrice;
      }
    });

    return methods;
  }, [filteredAppointments]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Data',
      'Horario',
      'Cliente',
      'Telefone',
      'Profissional',
      'Servicos',
      'Valor R$',
      'Forma Pagamento',
      'Status Pagamento',
      'Status Agendamento',
    ];

    const rows = filteredAppointments.map((a) => {
      const prof = professionals.find((p) => p.id === a.professionalId)?.name || 'N/A';
      const srvNames = a.serviceIds
        .map((id) => services.find((s) => s.id === id)?.name)
        .join(' + ');

      return [
        a.id,
        a.date,
        a.time,
        `"${a.customerName}"`,
        `"${a.customerPhone}"`,
        `"${prof}"`,
        `"${srvNames}"`,
        a.totalPrice.toFixed(2),
        a.paymentMethod,
        a.paymentStatus,
        a.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_financeiro_${businessConfig.type}_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Relatório Financeiro & Comissões</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Acompanhe o faturamento líquido, comissões de parceiros e formas de recebimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === 'today'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === 'month'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === 'all'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Geral
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
            <span>Faturamento Bruto Realizado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            R$ {totalGrossRevenue.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            + R$ {pendingRevenue.toFixed(2).replace('.', ',')} pendente
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
            <span>Comissões da Equipe</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            R$ {totalCommissionsOwed.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Total destinado aos profissionais parceiros
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
            <span>Lucro Líquido do Estabelecimento</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums">
            R$ {netHouseProfit.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Retenção após dedução de comissões
          </div>
        </div>
      </div>

      {/* Staff Commission Ledger */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow">
        <h2 className="text-base font-bold text-white mb-1">
          Fechamento de Comissões por Profissional
        </h2>
        <p className="text-xs text-neutral-400 mb-4">
          Cálculo exato com base na taxa percentual acordada de cada prestador de serviço.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Profissional</th>
                <th className="py-3 px-4 text-center">Atendimentos</th>
                <th className="py-3 px-4 text-right">Faturamento Bruto</th>
                <th className="py-3 px-4 text-center">Taxa (%)</th>
                <th className="py-3 px-4 text-right">Comissão a Pagar</th>
                <th className="py-3 px-4 text-right">Parte da Empresa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {commissionSummary.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-neutral-500">{item.role}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-neutral-300">
                    {item.appointmentsCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    R$ {item.grossGenerated.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-neutral-300">
                    {Math.round(item.commissionRate * 100)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 tabular-nums">
                    R$ {item.commissionOwed.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                    R$ {item.houseShare.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment methods breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Pix Instantâneo</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            R$ {paymentBreakdown.pix.total.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {paymentBreakdown.pix.count} transações
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>Cartão de Crédito</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            R$ {paymentBreakdown.credit.total.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {paymentBreakdown.credit.count} transações
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
            <CreditCard className="w-4 h-4 text-teal-400" />
            <span>Cartão de Débito</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            R$ {paymentBreakdown.debit.total.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {paymentBreakdown.debit.count} transações
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Dinheiro em Espécie</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            R$ {paymentBreakdown.cash.total.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {paymentBreakdown.cash.count} transações
          </div>
        </div>
      </div>
    </div>
  );
};

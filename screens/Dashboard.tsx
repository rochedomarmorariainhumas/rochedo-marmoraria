
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Hammer, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { storage } from '../services/storage.ts';
import { BudgetStatus, OrderStatus, TransactionType } from '../types.ts';

const Dashboard: React.FC = () => {
  const financeiro = storage.financeiro.getAll();
  const orcamentos = storage.orcamentos.getAll();
  const pedidos = storage.pedidos.getAll();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const faturamentoMes = financeiro
      .filter(f => f.tipo === TransactionType.INCOME && f.pago && new Date(f.data).getMonth() === currentMonth)
      .reduce((acc, curr) => acc + curr.valor, 0);

    const orcamentosPendentes = orcamentos.filter(o => o.status === BudgetStatus.PENDING).length;
    const pedidosEmAndamento = pedidos.filter(p => p.status !== OrderStatus.COMPLETED).length;
    
    const contasPagarHoje = financeiro
      .filter(f => f.tipo === TransactionType.EXPENSE && !f.pago && f.data === today)
      .reduce((acc, curr) => acc + curr.valor, 0);

    return { faturamentoMes, orcamentosPendentes, pedidosEmAndamento, contasPagarHoje };
  }, [financeiro, orcamentos, pedidos]);

  const chartData = [
    { name: 'Jan', value: 4500 },
    { name: 'Fev', value: 5200 },
    { name: 'Mar', value: 3800 },
    { name: 'Abr', value: 6500 },
    { name: 'Mai', value: 7200 },
    { name: 'Jun', value: stats.faturamentoMes || 8000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Bem-vindo, Administrador</h2>
        <p className="text-zinc-400 mt-1">Aqui está o resumo da sua marmoraria hoje.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Faturamento (Mês)" 
          value={`R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend="+12.5%"
          trendType="up"
          color="emerald"
        />
        <StatCard 
          title="Orçamentos Pendentes" 
          value={stats.orcamentosPendentes.toString()}
          icon={Clock}
          color="amber"
        />
        <StatCard 
          title="Pedidos em Produção" 
          value={stats.pedidosEmAndamento.toString()}
          icon={Hammer}
          color="blue"
        />
        <StatCard 
          title="Contas a Pagar (Hoje)" 
          value={`R$ ${stats.contasPagarHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Desempenho de Vendas</h3>
            <select className="bg-zinc-800 border-none rounded-lg text-sm px-3 py-1 text-zinc-300">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$${value}`} 
                />
                <Tooltip 
                  cursor={{ fill: '#27272a' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : '#3f3f46'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Next Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <QuickActionButton label="Novo Orçamento" color="emerald" />
            <QuickActionButton label="Adicionar Cliente" color="zinc" />
            <QuickActionButton label="Registrar Despesa" color="zinc" />
            <QuickActionButton label="Ver Agenda de Entregas" color="zinc" />
          </div>

          <hr className="my-6 border-zinc-800" />

          <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider mb-4">Próximas Entregas</h3>
          <div className="space-y-4">
            {pedidos.slice(0, 3).map(pedido => (
              <div key={pedido.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  {pedido.clienteNome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{pedido.clienteNome}</p>
                  <p className="text-xs text-zinc-500">{pedido.dataEntrega}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendType, color }: any) => {
  const colorMap: any = {
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    blue: 'bg-blue-500/10 text-blue-500',
    rose: 'bg-rose-500/10 text-rose-500',
    zinc: 'bg-zinc-500/10 text-zinc-500',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendType === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend}
            {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-zinc-400 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label, color }: any) => (
  <button className={`
    w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-zinc-800 text-left transition-all
    ${color === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-none' : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'}
  `}>
    {label}
  </button>
);

export default Dashboard;

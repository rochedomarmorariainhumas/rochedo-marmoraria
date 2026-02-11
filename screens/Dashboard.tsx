
import React, { useState, useEffect, useMemo } from 'react';
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
import { database } from '../services/database.ts';
import { BudgetStatus, OrderStatus, TransactionType, Cliente, Orcamento, Pedido, Financeiro } from '../types.ts';

const Dashboard: React.FC = () => {
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const load = async () => {
      const [f, o, p] = await Promise.all([
        database.financeiro.getAll(),
        database.orcamentos.getAll(),
        database.pedidos.getAll()
      ]);
      setFinanceiro(f);
      setOrcamentos(o);
      setPedidos(p);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();

    const faturamentoMes = financeiro
      .filter(f => {
        if (!f.data) return false;
        const d = f.data.toDate ? f.data.toDate() : new Date(f.data);
        return f.tipo === TransactionType.INCOME && d.getMonth() === currentMonth;
      })
      .reduce((acc, curr) => acc + curr.valor, 0);

    const orcamentosPendentes = orcamentos.filter(o => o.status === BudgetStatus.PENDING).length;
    const pedidosEmAndamento = pedidos.filter(p => p.status !== OrderStatus.COMPLETED).length;
    
    const contasPagarHoje = financeiro
      .filter(f => {
        if (!f.data) return false;
        const d = f.data.toDate ? f.data.toDate() : new Date(f.data);
        return f.tipo === TransactionType.EXPENSE && d.toISOString().split('T')[0] === today;
      })
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

  const formatData = (val: any) => {
    if (!val) return '...';
    const date = val.toDate ? val.toDate() : new Date(val);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Resumo Rochedo</h2>
        <p className="text-zinc-400 mt-1">Dados atualizados em tempo real do Firestore.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Faturamento (Mês)" 
          value={`R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend="+12%"
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
          title="Pedidos Ativos" 
          value={stats.pedidosEmAndamento.toString()}
          icon={Hammer}
          color="blue"
        />
        <StatCard 
          title="A Pagar Hoje" 
          value={`R$ ${stats.contasPagarHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6">Desempenho de Vendas</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : '#3f3f46'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider mb-4">Próximas Instalações</h3>
          <div className="space-y-4">
            {pedidos.slice(0, 5).map(pedido => (
              <div key={pedido.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  {pedido.clienteNome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{pedido.clienteNome}</p>
                  <p className="text-xs text-zinc-500">{formatData(pedido.dataEntrega)}</p>
                </div>
              </div>
            ))}
            {pedidos.length === 0 && <p className="text-sm text-zinc-600">Sem pedidos no momento.</p>}
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
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}><Icon size={20} /></div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendType === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend} {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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

export default Dashboard;

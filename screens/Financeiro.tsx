
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, Calendar, Filter } from 'lucide-react';
import { storage } from '../services/storage';
import { Financeiro, TransactionType } from '../types';

const FinanceiroScreen: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Financeiro[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    tipo: TransactionType.EXPENSE,
    categoria: 'Operacional',
    pago: false
  });

  useEffect(() => {
    setTransacoes(storage.financeiro.getAll());
  }, []);

  const totals = transacoes.reduce((acc, curr) => {
    if (curr.tipo === TransactionType.INCOME) acc.receitas += curr.valor;
    else acc.despesas += curr.valor;
    return acc;
  }, { receitas: 0, despesas: 0 });

  const balance = totals.receitas - totals.despesas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.financeiro.add({
      ...formData,
      valor: Number(formData.valor)
    });
    setTransacoes(storage.financeiro.getAll());
    setIsModalOpen(false);
    setFormData({ descricao: '', valor: 0, data: new Date().toISOString().split('T')[0], tipo: TransactionType.EXPENSE, categoria: 'Operacional', pago: false });
  };

  const toggleStatus = (id: string, current: boolean) => {
    storage.financeiro.update(id, { pago: !current });
    setTransacoes(storage.financeiro.getAll());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Financeiro</h2>
          <p className="text-zinc-400">Controle de entradas e saídas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
        >
          <Plus size={20} />
          Novo Lançamento
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Receitas" value={totals.receitas} icon={ArrowUpCircle} color="emerald" />
        <SummaryCard label="Despesas" value={totals.despesas} icon={ArrowDownCircle} color="rose" />
        <SummaryCard label="Saldo Líquido" value={balance} icon={DollarSign} color="blue" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold">Lançamentos Recentes</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-500"><Filter size={18} /></button>
            <button className="p-2 text-zinc-500"><Calendar size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/30">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transacoes.map(t => (
                <tr key={t.id} className="hover:bg-zinc-800/30">
                  <td className="px-6 py-4 text-sm text-zinc-400">{t.data}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{t.descricao}</p>
                    <p className="text-xs text-zinc-500">{t.categoria}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.tipo === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {t.tipo}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold ${t.tipo === TransactionType.INCOME ? 'text-emerald-500' : 'text-zinc-200'}`}>
                    {t.tipo === TransactionType.INCOME ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(t.id, t.pago)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        t.pago ? 'bg-zinc-800 text-zinc-400 border-transparent' : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {t.pago ? 'PAGO' : 'MARCAR PAGO'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Novo Lançamento</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-zinc-800 p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, tipo: TransactionType.EXPENSE})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.tipo === TransactionType.EXPENSE ? 'bg-rose-600 text-white' : 'text-zinc-500'}`}
                >
                  Despesa
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, tipo: TransactionType.INCOME})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.tipo === TransactionType.INCOME ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}
                >
                  Receita
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</label>
                <input required type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100" 
                  value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor (R$)</label>
                  <input required type="number" step="0.01" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100" 
                    value={formData.valor} onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</label>
                  <input required type="date" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100" 
                    value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categoria</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100" 
                  value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                  <option>Operacional</option>
                  <option>Estoque / Matéria Prima</option>
                  <option>Salários</option>
                  <option>Infraestrutura</option>
                  <option>Marketing</option>
                  <option>Venda</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-medium border border-zinc-800 rounded-xl">Cancelar</button>
                <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${formData.tipo === TransactionType.INCOME ? 'bg-emerald-600' : 'bg-rose-600'}`}>Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    emerald: 'text-emerald-500',
    rose: 'text-rose-500',
    blue: 'text-blue-500',
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className={colorMap[color]} />
        <span className="text-sm font-medium text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default FinanceiroScreen;

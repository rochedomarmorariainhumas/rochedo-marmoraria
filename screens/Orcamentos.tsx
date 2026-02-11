
import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, CheckCircle, Clock, XCircle, Printer } from 'lucide-react';
import { storage } from '../services/storage';
import { Orcamento, BudgetStatus, Cliente, OrderStatus } from '../types';

const Orcamentos: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: '',
    descricao: '',
    valorTotal: 0,
    validade: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrcamentos(storage.orcamentos.getAll());
    setClientes(storage.clientes.getAll());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) return;

    storage.orcamentos.add({
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      descricao: formData.descricao,
      valorTotal: Number(formData.valorTotal),
      status: BudgetStatus.PENDING,
      validade: formData.validade
    });

    setFormData({ clienteId: '', descricao: '', valorTotal: 0, validade: '' });
    setIsModalOpen(false);
    loadData();
  };

  const handleConvert = (o: Orcamento) => {
    if (confirm(`Deseja converter o orçamento #${o.id} em um pedido?`)) {
      storage.pedidos.add({
        orcamentoId: o.id,
        clienteId: o.clienteId,
        clienteNome: o.clienteNome,
        descricao: o.descricao,
        valorTotal: o.valorTotal,
        dataEntrega: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +15 days
        status: OrderStatus.IN_PRODUCTION
      });
      storage.orcamentos.update(o.id, { status: BudgetStatus.APPROVED });
      loadData();
      alert('Pedido gerado com sucesso! Verifique na tela de pedidos.');
    }
  };

  const getStatusStyle = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.PENDING: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case BudgetStatus.APPROVED: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case BudgetStatus.REJECTED: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Orçamentos</h2>
          <p className="text-zinc-400">Gere e converta orçamentos em pedidos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orcamentos.map(orcamento => (
                <tr key={orcamento.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-zinc-500">#{orcamento.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{orcamento.clienteNome}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">{orcamento.descricao}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(orcamento.status)}`}>
                      {orcamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-200">
                    R$ {orcamento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button title="Imprimir PDF" className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                        <Printer size={18} />
                      </button>
                      {orcamento.status === BudgetStatus.PENDING && (
                        <button 
                          onClick={() => handleConvert(orcamento)}
                          title="Converter em Pedido" 
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold"
                        >
                          <CheckCircle size={14} />
                          CONVERTER
                        </button>
                      )}
                    </div>
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
            <h3 className="text-2xl font-bold mb-6">Criar Orçamento</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</label>
                <select 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 appearance-none"
                  value={formData.clienteId}
                  onChange={e => setFormData({...formData, clienteId: e.target.value})}
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição dos Itens / Materiais</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Ex: Bancada de mármore para banheiro, medida 1.20 x 0.60..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor Total (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                    value={formData.valorTotal}
                    onChange={e => setFormData({...formData, valorTotal: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Válido até</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100"
                    value={formData.validade}
                    onChange={e => setFormData({...formData, validade: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-medium border border-zinc-800 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg">Gerar Orçamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orcamentos;

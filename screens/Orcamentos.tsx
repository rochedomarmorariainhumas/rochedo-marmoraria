
import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, CheckCircle, Clock, XCircle, Printer, Loader2, Share2, Edit2 } from 'lucide-react';
import { database } from '../services/database.ts';
import { pedidosService } from '../services/pedidosService.ts';
import { Orcamento, BudgetStatus, Cliente, OrderStatus } from '../types.ts';

interface OrcamentosProps {
  onNavigate?: (tab: string) => void;
}

const Orcamentos: React.FC<OrcamentosProps> = ({ onNavigate }) => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    descricao: '',
    material: '',
    metragem: 0,
    valor: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [o, c] = await Promise.all([
        database.orcamentos.getAll(),
        database.clientes.getAll()
      ]);
      setOrcamentos(o || []);
      setClientes(c || []);
    } catch (e) {
      console.error("Erro ao carregar dados de orçamentos:", e);
    }
  };

  const handleOpenModal = (orcamento: Orcamento | null = null) => {
    if (orcamento) {
      setEditingOrcamento(orcamento);
      setFormData({
        clienteId: orcamento.clienteId,
        descricao: orcamento.descricao,
        material: orcamento.material,
        metragem: orcamento.metragem,
        valor: orcamento.valor
      });
    } else {
      setEditingOrcamento(null);
      setFormData({ clienteId: '', descricao: '', material: '', metragem: 0, valor: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) return;

    setLoading(true);
    try {
      if (editingOrcamento) {
        await database.orcamentos.update(editingOrcamento.id, {
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          descricao: formData.descricao,
          material: formData.material,
          metragem: Number(formData.metragem),
          valor: Number(formData.valor)
        });
      } else {
        await database.orcamentos.add({
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          descricao: formData.descricao,
          material: formData.material,
          metragem: Number(formData.metragem),
          valor: Number(formData.valor),
          status: BudgetStatus.PENDING
        });
      }

      setFormData({ clienteId: '', descricao: '', material: '', metragem: 0, valor: 0 });
      setEditingOrcamento(null);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      alert(`Erro ao ${editingOrcamento ? 'atualizar' : 'criar'} orçamento.`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para aprovar orçamento e converter em pedido.
   */
  const aprovarOrcamento = async (orcamento: Orcamento) => {
    console.log("Aprovar acionado para:", orcamento.numeroDoc);
    
    // Define data padrão
    const defaultDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const dataEntrega = prompt("Confirme a data prevista de entrega (AAAA-MM-DD):", defaultDate);
    
    if (dataEntrega === null) {
      console.log("Aprovação cancelada pelo usuário.");
      return;
    }

    setApprovingId(orcamento.id);
    try {
      console.log("Processando aprovação via pedidosService...");
      const pedidoId = await pedidosService.aprovarOrcamento(orcamento, dataEntrega || defaultDate);
      
      console.log("Sucesso! Pedido gerado:", pedidoId);
      
      if (onNavigate) {
        onNavigate('pedidos');
      } else {
        await loadData();
      }
    } catch (err: any) {
      console.error("Erro na aprovação:", err);
      alert(err.message || 'Erro ao aprovar orçamento.');
    } finally {
      setApprovingId(null);
    }
  };

  const printDocument = (o: Orcamento) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `
      <html>
        <head>
          <title>Orçamento ${o.numeroDoc}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #10b981; }
            .doc-info { text-align: right; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; margin-top: 5px; }
            .footer { margin-top: 100px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 12px; }
            .signature { margin-top: 50px; border-top: 1px solid #000; width: 300px; margin-left: auto; margin-right: auto; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ROCHEDO MARMORARIA</div>
            <div class="doc-info">
              <div><strong>ORÇAMENTO ${o.numeroDoc}</strong></div>
              <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
          <div class="section">
            <div class="label">Cliente</div>
            <div class="value">${o.clienteNome}</div>
          </div>
          <div class="section">
            <div class="label">Material</div>
            <div class="value">${o.material} (${o.metragem} m²)</div>
          </div>
          <div class="section">
            <div class="label">Descrição</div>
            <div class="value">${o.descricao || 'Nenhuma observação.'}</div>
          </div>
          <div class="section" style="background: #f4f4f5; padding: 20px; border-radius: 8px;">
            <div class="label">Valor Total</div>
            <div class="value" style="font-size: 24px; font-weight: bold;">R$ ${o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="footer">
            <div class="signature">Assinatura do Cliente</div>
            <p style="margin-top: 30px;">Rochedo Marmoraria - Excelência em Pedras Naturais</p>
          </div>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const shareWhatsApp = (o: Orcamento) => {
    const text = `*ROCHEDO MARMORARIA*\n\nOlá, ${o.clienteNome}!\nSegue seu orçamento *${o.numeroDoc}*:\n\n*Material:* ${o.material}\n*Medida:* ${o.metragem} m²\n*Valor:* R$ ${o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEstamos à disposição!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusStyle = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.PENDING: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case BudgetStatus.APPROVED: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case BudgetStatus.REJECTED: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Orçamentos</h2>
          <p className="text-zinc-400">Fluxo: Orçamento → Pedido → Financeiro.</p>
        </div>
        <button 
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orcamentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">Nenhum orçamento cadastrado.</td>
                </tr>
              ) : orcamentos.map(orcamento => (
                <tr key={orcamento.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-zinc-500">{orcamento.numeroDoc || 'ORC-0000'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-100">{orcamento.clienteNome}</p>
                    <p className="text-xs text-zinc-500">{orcamento.material} • {orcamento.metragem} m²</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(orcamento.status)}`}>
                      {orcamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-200">
                    R$ {orcamento.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {orcamento.status === BudgetStatus.PENDING && (
                        <>
                          <button 
                            type="button"
                            disabled={approvingId === orcamento.id}
                            onClick={() => aprovarOrcamento(orcamento)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approvingId === orcamento.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            APROVAR
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleOpenModal(orcamento)} 
                            title="Editar Orçamento" 
                            className="p-2 text-zinc-400 hover:text-blue-400 bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        type="button"
                        onClick={() => printDocument(orcamento)} 
                        title="Imprimir PDF" 
                        className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Printer size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => shareWhatsApp(orcamento)} 
                        title="Compartilhar WhatsApp" 
                        className="p-2 text-zinc-400 hover:text-emerald-500 bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Share2 size={16} />
                      </button>
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">{editingOrcamento ? `Editar Orçamento ${editingOrcamento.numeroDoc}` : 'Criar Orçamento'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</label>
                <select required className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                  value={formData.clienteId} onChange={e => setFormData({...formData, clienteId: e.target.value})}>
                  <option value="">Selecionar Cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Material</label>
                <input required type="text" placeholder="Ex: Granito Preto São Gabriel" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                  value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Metragem (m²)</label>
                  <input required type="number" step="0.01" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                    value={formData.metragem} onChange={e => setFormData({...formData, metragem: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor Total (R$)</label>
                  <input required type="number" step="0.01" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                    value={formData.valor} onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição dos Detalhes</label>
                <textarea rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                  value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-medium border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : (editingOrcamento ? 'Salvar Alterações' : 'Gerar Orçamento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orcamentos;

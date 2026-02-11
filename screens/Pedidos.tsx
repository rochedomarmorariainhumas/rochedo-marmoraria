
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Filter, Loader2, Printer, Share2, Circle } from 'lucide-react';
import { database } from '../services/database.ts';
import { Pedido, OrderStatus } from '../types.ts';

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await database.pedidos.getAll();
      setPedidos(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PRODUCTION: return Package;
      case OrderStatus.INSTALLATION: return Truck;
      case OrderStatus.COMPLETED: return CheckCircle2;
      default: return Package;
    }
  };

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    setLoading(true);
    await database.pedidos.updateStatus(id, newStatus);
    await loadData();
    setLoading(false);
  };

  const togglePagamento = async (pedido: Pedido) => {
    setLoading(true);
    await database.pedidos.updatePagamento(pedido.id, !pedido.pago);
    await loadData();
    setLoading(false);
  };

  const printPedido = (p: Pedido) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>Pedido ${p.numeroDoc}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #10b981;">ROCHEDO MARMORARIA</h1>
          <hr/>
          <h2>PEDIDO ${p.numeroDoc}</h2>
          <p><strong>Cliente:</strong> ${p.clienteNome}</p>
          <p><strong>Descrição:</strong> ${p.descricao}</p>
          <p><strong>Valor:</strong> R$ ${p.valorFinal.toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> ${p.status}</p>
          <p><strong>Data Entrega:</strong> ${formatDate(p.dataEntrega)}</p>
          <br/><br/><br/>
          <div style="border-top: 1px solid #000; width: 300px; text-align: center;">Assinatura Rochedo</div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const sharePedido = (p: Pedido) => {
    const text = `*ROCHEDO MARMORARIA*\n\nPedido: *${p.numeroDoc}*\nCliente: ${p.clienteNome}\nStatus: ${p.status.toUpperCase()}\nPrevisão: ${formatDate(p.dataEntrega)}\n\nAgradecemos a preferência!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatDate = (val: any) => {
    if (!val) return '...';
    if (typeof val === 'string') return val;
    const date = val.toDate ? val.toDate() : new Date(val);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pedidos em Andamento</h2>
          <p className="text-zinc-400">Acompanhe a produção e instalação.</p>
        </div>
        <button className="p-3 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Filter size={20} />
        </button>
      </header>

      {loading && pedidos.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map(pedido => {
            const Icon = getStatusIcon(pedido.status);
            return (
              <div key={pedido.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                  <div className={`p-4 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                    pedido.status === OrderStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <Icon size={32} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-emerald-500 font-bold">{pedido.numeroDoc || 'PED-0000'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        pedido.status === OrderStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {pedido.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold truncate">{pedido.clienteNome}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{pedido.descricao || 'Pedido de Marmoraria'}</p>
                    
                    <button 
                      onClick={() => togglePagamento(pedido)}
                      className={`mt-3 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        pedido.pago ? 'bg-emerald-600/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {pedido.pago ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      {pedido.pago ? 'PAGO' : 'PENDENTE DE PAGAMENTO'}
                    </button>
                  </div>

                  <div className="md:border-l border-zinc-800 md:pl-6 space-y-2">
                    <div className="text-sm text-zinc-400">Previsão:</div>
                    <div className="font-semibold text-emerald-500">{formatDate(pedido.dataEntrega)}</div>
                    <div className="text-lg font-bold">R$ {pedido.valorFinal?.toLocaleString('pt-BR')}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <select 
                      disabled={loading}
                      className="bg-zinc-800 border-none rounded-lg text-sm px-4 py-2 font-medium focus:ring-emerald-500 ring-1 ring-zinc-700 cursor-pointer"
                      value={pedido.status}
                      onChange={(e) => updateStatus(pedido.id, e.target.value as OrderStatus)}
                    >
                      <option value={OrderStatus.PRODUCTION}>Em Produção</option>
                      <option value={OrderStatus.INSTALLATION}>Instalação</option>
                      <option value={OrderStatus.COMPLETED}>Concluído</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => printPedido(pedido)} className="flex-1 p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white flex justify-center"><Printer size={16} /></button>
                      <button onClick={() => sharePedido(pedido)} className="flex-1 p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 flex justify-center"><Share2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {pedidos.length === 0 && !loading && (
            <div className="py-20 text-center text-zinc-500">Nenhum pedido em andamento.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pedidos;

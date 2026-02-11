
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { storage } from '../services/storage';
import { Pedido, OrderStatus } from '../types';

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    setPedidos(storage.pedidos.getAll());
  }, []);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.IN_PRODUCTION: return Package;
      case OrderStatus.WAITING_INSTALLATION: return Truck;
      case OrderStatus.COMPLETED: return CheckCircle2;
    }
  };

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    storage.pedidos.update(id, { status: newStatus });
    setPedidos(storage.pedidos.getAll());
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
                    <span className="text-xs font-mono text-zinc-500">#{pedido.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      pedido.status === OrderStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {pedido.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold truncate">{pedido.clienteNome}</h3>
                  <p className="text-zinc-500 text-sm mt-1">{pedido.descricao}</p>
                </div>

                <div className="md:border-l border-zinc-800 md:pl-6 space-y-2">
                  <div className="text-sm text-zinc-400">Entrega prevista:</div>
                  <div className="font-semibold text-emerald-500">{pedido.dataEntrega}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <select 
                    className="bg-zinc-800 border-none rounded-lg text-sm px-4 py-2 font-medium focus:ring-emerald-500 ring-1 ring-zinc-700"
                    value={pedido.status}
                    onChange={(e) => updateStatus(pedido.id, e.target.value as OrderStatus)}
                  >
                    <option value={OrderStatus.IN_PRODUCTION}>Em Produção</option>
                    <option value={OrderStatus.WAITING_INSTALLATION}>Aguardando Instalação</option>
                    <option value={OrderStatus.COMPLETED}>Concluído</option>
                  </select>
                  <button className="text-zinc-400 hover:text-white text-xs font-medium px-4 py-2">
                    Ver Detalhes do Pedido
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pedidos;

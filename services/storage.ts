
import { Pedido, Orcamento, Cliente, Financeiro } from '../types.ts';

// Helper to interact with localStorage
const get = (key: string) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error(`Error reading from localStorage ${key}:`, e);
    return [];
  }
};

const set = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

// Central storage for mock mode
export const storage = {
  clientes: {
    getAll: (): Cliente[] => get('rochedo_clientes'),
    save: (data: Cliente[]) => set('rochedo_clientes', data)
  },
  orcamentos: {
    getAll: (): Orcamento[] => get('rochedo_orcamentos'),
    save: (data: Orcamento[]) => set('rochedo_orcamentos', data)
  },
  pedidos: {
    getAll: (): Pedido[] => get('rochedo_pedidos'),
    save: (data: Pedido[]) => set('rochedo_pedidos', data)
  },
  financeiro: {
    getAll: (): Financeiro[] => get('rochedo_financeiro'),
    save: (data: Financeiro[]) => set('rochedo_financeiro', data)
  }
};

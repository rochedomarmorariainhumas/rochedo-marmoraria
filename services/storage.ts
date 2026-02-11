
import { Cliente, Orcamento, Pedido, Financeiro, BudgetStatus, OrderStatus, TransactionType } from '../types';

const STORAGE_KEYS = {
  CLIENTES: 'rochedo_clientes',
  ORCAMENTOS: 'rochedo_orcamentos',
  PEDIDOS: 'rochedo_pedidos',
  FINANCEIRO: 'rochedo_financeiro',
};

const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Demo Data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CLIENTES)) {
    const mockClientes: Cliente[] = [
      { id: '1', nome: 'João Silva', documento: '123.456.789-00', email: 'joao@email.com', telefone: '(11) 98888-7777', endereco: 'Rua das Flores, 123', createdAt: Date.now() },
      { id: '2', nome: 'Maria Oliveira', documento: '987.654.321-11', email: 'maria@email.com', telefone: '(11) 97777-6666', endereco: 'Av. Paulista, 1500', createdAt: Date.now() },
    ];
    save(STORAGE_KEYS.CLIENTES, mockClientes);
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORCAMENTOS)) {
    const mockOrcamentos: Orcamento[] = [
      { id: 'o1', clienteId: '1', clienteNome: 'João Silva', descricao: 'Bancada Cozinha Granito Preto São Gabriel', valorTotal: 3500.00, status: BudgetStatus.PENDING, validade: '2023-12-31', createdAt: Date.now() },
    ];
    save(STORAGE_KEYS.ORCAMENTOS, mockOrcamentos);
  }

  if (!localStorage.getItem(STORAGE_KEYS.PEDIDOS)) {
    const mockPedidos: Pedido[] = [
      { id: 'p1', orcamentoId: 'o0', clienteId: '2', clienteNome: 'Maria Oliveira', descricao: 'Lavatório Mármore Carrara', valorTotal: 1200.00, dataEntrega: '2023-11-20', status: OrderStatus.IN_PRODUCTION, createdAt: Date.now() },
    ];
    save(STORAGE_KEYS.PEDIDOS, mockPedidos);
  }

  if (!localStorage.getItem(STORAGE_KEYS.FINANCEIRO)) {
    const mockFinanceiro: Financeiro[] = [
      { id: 'f1', descricao: 'Compra de Insumos', valor: 500.00, data: new Date().toISOString().split('T')[0], tipo: TransactionType.EXPENSE, pago: false, categoria: 'Estoque', createdAt: Date.now() },
      { id: 'f2', descricao: 'Recebimento Pedido #P1', valor: 1200.00, data: new Date().toISOString().split('T')[0], tipo: TransactionType.INCOME, pago: true, categoria: 'Venda', createdAt: Date.now() },
    ];
    save(STORAGE_KEYS.FINANCEIRO, mockFinanceiro);
  }
};

initializeData();

export const storage = {
  clientes: {
    getAll: () => get<Cliente>(STORAGE_KEYS.CLIENTES),
    add: (c: Omit<Cliente, 'id' | 'createdAt'>) => {
      const all = get<Cliente>(STORAGE_KEYS.CLIENTES);
      const newItem = { ...c, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
      save(STORAGE_KEYS.CLIENTES, [...all, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Cliente>) => {
      const all = get<Cliente>(STORAGE_KEYS.CLIENTES);
      const updated = all.map(item => item.id === id ? { ...item, ...updates } : item);
      save(STORAGE_KEYS.CLIENTES, updated);
    },
    delete: (id: string) => {
      const all = get<Cliente>(STORAGE_KEYS.CLIENTES);
      save(STORAGE_KEYS.CLIENTES, all.filter(i => i.id !== id));
    }
  },
  orcamentos: {
    getAll: () => get<Orcamento>(STORAGE_KEYS.ORCAMENTOS),
    add: (o: Omit<Orcamento, 'id' | 'createdAt'>) => {
      const all = get<Orcamento>(STORAGE_KEYS.ORCAMENTOS);
      const newItem = { ...o, id: `orc-${Math.random().toString(36).substr(2, 5)}`, createdAt: Date.now() };
      save(STORAGE_KEYS.ORCAMENTOS, [...all, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Orcamento>) => {
      const all = get<Orcamento>(STORAGE_KEYS.ORCAMENTOS);
      const updated = all.map(item => item.id === id ? { ...item, ...updates } : item);
      save(STORAGE_KEYS.ORCAMENTOS, updated);
    }
  },
  pedidos: {
    getAll: () => get<Pedido>(STORAGE_KEYS.PEDIDOS),
    add: (p: Omit<Pedido, 'id' | 'createdAt'>) => {
      const all = get<Pedido>(STORAGE_KEYS.PEDIDOS);
      const newItem = { ...p, id: `ped-${Math.random().toString(36).substr(2, 5)}`, createdAt: Date.now() };
      save(STORAGE_KEYS.PEDIDOS, [...all, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Pedido>) => {
      const all = get<Pedido>(STORAGE_KEYS.PEDIDOS);
      const updated = all.map(item => item.id === id ? { ...item, ...updates } : item);
      save(STORAGE_KEYS.PEDIDOS, updated);
    }
  },
  financeiro: {
    getAll: () => get<Financeiro>(STORAGE_KEYS.FINANCEIRO),
    add: (f: Omit<Financeiro, 'id' | 'createdAt'>) => {
      const all = get<Financeiro>(STORAGE_KEYS.FINANCEIRO);
      const newItem = { ...f, id: `fin-${Math.random().toString(36).substr(2, 5)}`, createdAt: Date.now() };
      save(STORAGE_KEYS.FINANCEIRO, [...all, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Financeiro>) => {
      const all = get<Financeiro>(STORAGE_KEYS.FINANCEIRO);
      const updated = all.map(item => item.id === id ? { ...item, ...updates } : item);
      save(STORAGE_KEYS.FINANCEIRO, updated);
    }
  }
};

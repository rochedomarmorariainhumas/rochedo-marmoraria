
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { storage } from './storage.ts';
import { 
  Cliente, 
  Orcamento, 
  Pedido, 
  Financeiro, 
  BudgetStatus, 
  OrderStatus, 
  TransactionType 
} from '../types.ts';

const isMockMode = () => localStorage.getItem('rochedo_mock_auth') === 'true';

const getCol = (name: string) => collection(db, name);

// Database service implementing CRUD for all entities
export const database = {
  clientes: {
    getAll: async (): Promise<Cliente[]> => {
      if (isMockMode()) return storage.clientes.getAll();
      try {
        const snap = await getDocs(getCol('clientes'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente));
      } catch (e) {
        console.warn("Firestore error, falling back to storage:", e);
        return storage.clientes.getAll();
      }
    },
    add: async (data: Omit<Cliente, 'id'>) => {
      if (isMockMode()) {
        const all = storage.clientes.getAll();
        const newItem = { ...data, id: Math.random().toString(36).substr(2, 9) };
        storage.clientes.save([...all, newItem]);
        return newItem.id;
      }
      const docRef = await addDoc(getCol('clientes'), data);
      return docRef.id;
    },
    update: async (id: string, data: Partial<Cliente>) => {
      if (isMockMode()) {
        const all = storage.clientes.getAll();
        storage.clientes.save(all.map(c => c.id === id ? { ...c, ...data } : c));
        return;
      }
      await updateDoc(doc(db, 'clientes', id), data);
    },
    delete: async (id: string) => {
      if (isMockMode()) {
        const all = storage.clientes.getAll();
        storage.clientes.save(all.filter(c => c.id !== id));
        return;
      }
      await deleteDoc(doc(db, 'clientes', id));
    }
  },
  orcamentos: {
    getAll: async (): Promise<Orcamento[]> => {
      if (isMockMode()) return storage.orcamentos.getAll();
      try {
        const q = query(getCol('orcamentos'), orderBy('dataCriacao', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Orcamento));
      } catch (e) {
        console.warn("Firestore error, falling back to storage:", e);
        return storage.orcamentos.getAll();
      }
    },
    add: async (data: Omit<Orcamento, 'id' | 'numeroDoc'>) => {
      const numeroDoc = `ORC-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = { ...data, numeroDoc, dataCriacao: Timestamp.now() };
      if (isMockMode()) {
        const all = storage.orcamentos.getAll();
        const newItem = { ...payload, id: Math.random().toString(36).substr(2, 9) };
        storage.orcamentos.save([...all, newItem]);
        return newItem.id;
      }
      const docRef = await addDoc(getCol('orcamentos'), payload);
      return docRef.id;
    },
    update: async (id: string, data: Partial<Orcamento>) => {
      if (isMockMode()) {
        const all = storage.orcamentos.getAll();
        storage.orcamentos.save(all.map(o => o.id === id ? { ...o, ...data } : o));
        return;
      }
      await updateDoc(doc(db, 'orcamentos', id), data);
    },
    aprovar: async (orcamento: Orcamento, dataEntrega: string) => {
      const pedidoNumero = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
      
      if (isMockMode()) {
        const orcs = storage.orcamentos.getAll();
        storage.orcamentos.save(orcs.map(o => o.id === orcamento.id ? { ...o, status: BudgetStatus.APPROVED } : o));
        
        const peds = storage.pedidos.getAll();
        const newPed: Pedido = {
          id: Math.random().toString(36).substr(2, 9),
          numeroDoc: pedidoNumero,
          orcamentoId: orcamento.id,
          clienteId: orcamento.clienteId,
          clienteNome: orcamento.clienteNome,
          descricao: orcamento.descricao,
          valorFinal: orcamento.valor,
          status: OrderStatus.PRODUCTION,
          pago: false,
          dataEntrega,
          dataAprovacao: new Date()
        };
        storage.pedidos.save([...peds, newPed]);

        const fins = storage.financeiro.getAll();
        storage.financeiro.save([...fins, {
          id: Math.random().toString(36).substr(2, 9),
          descricao: `Pedido ${pedidoNumero} - ${orcamento.clienteNome}`,
          valor: orcamento.valor,
          data: new Date(),
          tipo: TransactionType.INCOME,
          categoria: 'Venda',
          pago: false,
          referenciaId: newPed.id
        }]);
        
        return newPed.id;
      }

      return await runTransaction(db, async (transaction) => {
        const orcRef = doc(db, 'orcamentos', orcamento.id);
        transaction.update(orcRef, { status: BudgetStatus.APPROVED });

        const pedidoRef = doc(collection(db, 'pedidos'));
        const pedidoData = {
          numeroDoc: pedidoNumero,
          orcamentoId: orcamento.id,
          clienteId: orcamento.clienteId,
          clienteNome: orcamento.clienteNome,
          descricao: orcamento.descricao,
          valorFinal: orcamento.valor,
          status: OrderStatus.PRODUCTION,
          pago: false,
          dataEntrega: dataEntrega,
          dataAprovacao: Timestamp.now()
        };
        transaction.set(pedidoRef, pedidoData);

        const finRef = doc(collection(db, 'financeiro'));
        transaction.set(finRef, {
          descricao: `Pedido ${pedidoNumero} - ${orcamento.clienteNome}`,
          valor: orcamento.valor,
          data: Timestamp.now(),
          tipo: TransactionType.INCOME,
          categoria: 'Venda',
          pago: false,
          referenciaId: pedidoRef.id
        });

        return pedidoRef.id;
      });
    }
  },
  pedidos: {
    getAll: async (): Promise<Pedido[]> => {
      if (isMockMode()) return storage.pedidos.getAll();
      try {
        const snap = await getDocs(getCol('pedidos'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Pedido));
      } catch (e) {
        console.warn("Firestore error, falling back to storage:", e);
        return storage.pedidos.getAll();
      }
    },
    updateStatus: async (id: string, status: OrderStatus) => {
      if (isMockMode()) {
        const all = storage.pedidos.getAll();
        storage.pedidos.save(all.map(p => p.id === id ? { ...p, status } : p));
        return;
      }
      await updateDoc(doc(db, 'pedidos', id), { status });
    },
    updatePagamento: async (id: string, pago: boolean) => {
      if (isMockMode()) {
        const all = storage.pedidos.getAll();
        storage.pedidos.save(all.map(p => p.id === id ? { ...p, pago } : p));
        return;
      }
      await updateDoc(doc(db, 'pedidos', id), { pago });
    }
  },
  financeiro: {
    getAll: async (): Promise<Financeiro[]> => {
      if (isMockMode()) return storage.financeiro.getAll();
      try {
        const q = query(getCol('financeiro'), orderBy('data', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Financeiro));
      } catch (e) {
        console.warn("Firestore error, falling back to storage:", e);
        return storage.financeiro.getAll();
      }
    },
    add: async (data: Omit<Financeiro, 'id'>) => {
      if (isMockMode()) {
        const all = storage.financeiro.getAll();
        const newItem = { ...data, id: Math.random().toString(36).substr(2, 9) };
        storage.financeiro.save([...all, newItem]);
        return newItem.id;
      }
      const docRef = await addDoc(getCol('financeiro'), {
        ...data,
        data: data.data instanceof Date ? Timestamp.fromDate(data.data) : data.data
      });
      return docRef.id;
    }
  }
};

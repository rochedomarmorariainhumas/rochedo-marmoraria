
import { database } from "./database.ts";
import { storage } from "./storage.ts";
import { Orcamento, BudgetStatus, OrderStatus, TransactionType, Pedido } from "../types.ts";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit 
} from "firebase/firestore";
import { db } from "./firebase.ts";

const isMockMode = () => localStorage.getItem('rochedo_mock_auth') === 'true';

export const pedidosService = {
  /**
   * Verifica se já existe um pedido vinculado a este orçamento para evitar duplicatas.
   */
  async verificarPedidoExistente(orcamentoId: string): Promise<boolean> {
    if (isMockMode()) {
      const all = storage.pedidos.getAll();
      return all.some(p => p.orcamentoId === orcamentoId);
    }
    try {
      const q = query(
        collection(db, "pedidos"), 
        where("orcamentoId", "==", orcamentoId), 
        limit(1)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (e) {
      console.warn("Falha na consulta Firestore para verificar pedido, verificando storage local.");
      const all = storage.pedidos.getAll();
      return all.some(p => p.orcamentoId === orcamentoId);
    }
  },

  /**
   * Aprova um orçamento, gera o pedido e cria o lançamento financeiro.
   */
  async aprovarOrcamento(orcamento: Orcamento, dataEntrega: string): Promise<string> {
    // 1. Validar se já existe um pedido
    const jaExiste = await this.verificarPedidoExistente(orcamento.id);
    if (jaExiste) {
      throw new Error("Este orçamento já foi convertido em um pedido anteriormente.");
    }

    // 2. Processar a aprovação (Transação Firestore com Fallback Local)
    // O método 'database.orcamentos.aprovar' já gerencia:
    // - Mudança de status do orçamento para 'aprovado'
    // - Geração de número PED-XXXX incremental
    // - Criação do documento na coleção 'pedidos'
    // - Criação do lançamento na coleção 'financeiro' com referenciaId
    const pedidoId = await database.orcamentos.aprovar(orcamento, dataEntrega);
    
    if (!pedidoId) {
      throw new Error("Erro inesperado: O ID do pedido não foi gerado.");
    }

    return pedidoId;
  }
};

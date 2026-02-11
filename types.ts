
// Types for Rochedo Marmoraria

export enum BudgetStatus {
  PENDING = 'pendente',
  APPROVED = 'aprovado',
  REJECTED = 'rejeitado'
}

export enum OrderStatus {
  PRODUCTION = 'produção',
  INSTALLATION = 'instalação',
  COMPLETED = 'concluído'
}

export enum TransactionType {
  INCOME = 'receita',
  EXPENSE = 'despesa'
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes?: string;
}

export interface Orcamento {
  id: string;
  numeroDoc: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  material: string;
  metragem: number;
  valor: number;
  status: BudgetStatus;
  dataCriacao?: any;
}

export interface Pedido {
  id: string;
  numeroDoc: string;
  orcamentoId: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  valorFinal: number;
  status: OrderStatus;
  pago: boolean;
  dataEntrega: any;
  dataAprovacao?: any;
}

export interface Financeiro {
  id: string;
  descricao: string;
  valor: number;
  data: any;
  tipo: TransactionType;
  categoria: string;
  pago: boolean;
  referenciaId?: string | null;
}

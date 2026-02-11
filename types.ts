
export enum TransactionType {
  INCOME = 'RECEITA',
  EXPENSE = 'DESPESA'
}

export enum BudgetStatus {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADO',
  REJECTED = 'REJEITADO'
}

export enum OrderStatus {
  IN_PRODUCTION = 'EM PRODUÇÃO',
  WAITING_INSTALLATION = 'AGUARDANDO INSTALAÇÃO',
  COMPLETED = 'CONCLUÍDO'
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  createdAt: number;
}

export interface Orcamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  valorTotal: number;
  status: BudgetStatus;
  validade: string;
  createdAt: number;
}

export interface Pedido {
  id: string;
  orcamentoId: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  valorTotal: number;
  dataEntrega: string;
  status: OrderStatus;
  createdAt: number;
}

export interface Financeiro {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: TransactionType;
  pago: boolean;
  categoria: string;
  createdAt: number;
}

export interface DashboardStats {
  faturamentoMes: number;
  orcamentosPendentes: number;
  pedidosEmAndamento: number;
  contasPagarHoje: number;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  /** Decimal string with 2 places, e.g. "1250.50" */
  amount: string;
  /** YYYY-MM-DD */
  date: string;
  description: string | null;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryTotal {
  categoryId: number;
  name: string;
  total: string;
  percentage: number;
}

export interface DashboardSummary {
  period: { startDate: string; endDate: string };
  totals: { income: string; expense: string; balance: string };
  expenseByCategory: CategoryTotal[];
  incomeByCategory: CategoryTotal[];
  recentTransactions: Transaction[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export type InvestmentType =
  | "MUTUAL_FUND"
  | "STOCKS"
  | "GOLD"
  | "FIXED_DEPOSIT"
  | "BONDS"
  | "REAL_ESTATE"
  | "CRYPTO"
  | "OTHER";

export interface Investment {
  id: number;
  name: string;
  type: InvestmentType;
  /** Decimal strings with 2 places */
  investedAmount: string;
  currentValue: string;
  /** currentValue − investedAmount; negative for a loss */
  returnAmount: string;
  /** returnAmount as a % of investedAmount, 2 decimals */
  returnPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentSummary {
  totalInvested: string;
  currentValue: string;
  totalReturn: string;
  returnPercentage: number;
  /** Share of current value per type, largest first */
  allocation: { type: InvestmentType; currentValue: string; percentage: number }[];
}

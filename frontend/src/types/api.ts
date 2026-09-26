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

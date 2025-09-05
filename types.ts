
export enum TransactionType {
  INCOME = 'Masuk',
  EXPENSE = 'Keluar',
}

export enum TransactionSource {
  SIDE_JOB = 'sideJob',
  STUDIO = 'studio',
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
}

export interface Assets {
  bankA: number;
  bankB: number;
  cash: number;
  reksadana: number;
  eWallet: number;
}

export interface Allocation {
  id: string;
  category: string;
  targetPercentage: number;
  actualBalance: number;
  specificTarget?: number;
}

export interface MonthlyRecapData {
  month: string;
  initialBalance: number;
  totalIncomeSideJob: number;
  totalIncomeStudio: number;
  totalExpense: number;
  investment: number; // Assuming investment is a type of expense for calculation
  finalBalance: number;
}

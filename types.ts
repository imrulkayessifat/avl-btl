
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  NEW_PROJECT = 'NEW_PROJECT',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  HISTORY = 'HISTORY',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export interface User {
  username: string;
  role: UserRole;
  password?: string; // Added for mock persistence
}

export interface ProjectAttachment {
  name: string;
  data: string; // base64
  type: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  advanceAmount: number;
  expenseAmount: number;
  balanceAmount: number;
  billSubmissionDate: string;
  sopRoiEmailSubmissionDate: string;
  billTopSheetImage?: ProjectAttachment;
  budgetCopyAttachment?: ProjectAttachment;
  createdAt: string;
  isSettled?: boolean;
}

export interface FinancialSummary {
  totalBudget: number;
  totalAdvance: number;
  totalExpense: number;
  totalBalance: number;
}

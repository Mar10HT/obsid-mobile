// Core types are now Zod-inferred — import from schemas for runtime validation
export type { LoanStatus, Loan, LoansListResponse } from './schemas';

export type LoanFilterTab = 'PENDING' | 'ACTIVE' | 'RETURN_PENDING';

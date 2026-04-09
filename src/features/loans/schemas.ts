import { z } from 'zod';

export const LoanStatusSchema = z.enum([
  'PENDING',
  'SENT',
  'RECEIVED',
  'RETURN_PENDING',
  'RETURNED',
  'OVERDUE',
  'CANCELLED',
]);

export const LoanSchema = z.object({
  id: z.string(),
  status: LoanStatusSchema,
  quantity: z.number(),
  loanDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().optional(),
  notes: z.string().optional(),
  sendQrCode: z.string().optional(),
  returnQrCode: z.string().optional(),
  inventoryItem: z.object({ id: z.string(), name: z.string(), serviceTag: z.string().optional() }),
  sourceWarehouse: z.object({ id: z.string(), name: z.string() }),
  destinationWarehouse: z.object({ id: z.string(), name: z.string() }),
  createdBy: z.object({ id: z.string(), name: z.string() }),
});

const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const LoansListResponseSchema = z.object({
  data: z.array(LoanSchema),
  meta: PaginationMetaSchema,
});

export type LoanStatus = z.infer<typeof LoanStatusSchema>;
export type Loan = z.infer<typeof LoanSchema>;
export type LoansListResponse = z.infer<typeof LoansListResponseSchema>;

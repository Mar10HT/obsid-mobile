import { z } from 'zod';
import { SupplierSchema } from './schemas';

export type Supplier = z.infer<typeof SupplierSchema>;

import { z } from 'zod';
import { WarehouseSchema } from './schemas';

export type Warehouse = z.infer<typeof WarehouseSchema>;

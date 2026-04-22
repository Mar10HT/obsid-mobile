import { z } from 'zod';
import { CategorySchema } from './schemas';

export type Category = z.infer<typeof CategorySchema>;

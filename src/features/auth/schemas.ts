import { z } from 'zod';

const jwtString = z.string().min(20).regex(
  /^[\w+/=-]+\.[\w+/=-]+\.[\w+/=-]*$/,
  'Invalid JWT format'
);

export const AuthTokensSchema = z.object({
  access_token: jwtString,
  refresh_token: jwtString,
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  permissions: z.array(z.string()),
  permissionsVersion: z.number().int(),
  warehouseId: z.string().optional(),
});

export const GetMeResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    warehouseId: z.string().optional(),
  }),
  permissions: z.array(z.string()),
  permissionsVersion: z.number().int(),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;

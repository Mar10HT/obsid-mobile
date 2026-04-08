import { z } from 'zod';

const envSchema = z.object({
  // Required in production; optional in dev (auto-detected from Expo's hostUri)
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
});

// Validated at module load time — throws a descriptive error if the shape is wrong
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`[env] Invalid environment variables:\n${formatted}`);
}

export const env = parsed.data;

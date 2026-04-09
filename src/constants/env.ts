import { z } from 'zod';

const envSchema = z.object({
  // Required in production; optional in dev (auto-detected from Expo's hostUri)
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
});

// Validated at module load time — throws a descriptive error if the shape is wrong.
// Variables are constructed explicitly because Metro statically inlines EXPO_PUBLIC_*
// vars as string literals; spreading process.env is unreliable in the Expo/Metro runtime.
const parsed = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`[env] Invalid environment variables:\n${formatted}`);
}

export const env = parsed.data;

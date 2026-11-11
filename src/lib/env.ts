// Central access to environment variables, with a clear error when one is missing.
// NEXT_PUBLIC_* values must be referenced literally (process.env.NEXT_PUBLIC_X) so Next.js can inline them.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`[env] Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: () =>
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
};

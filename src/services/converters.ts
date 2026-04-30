// src/services/converters.ts
// Centralized mapping functions to normalize Laravel API responses into
// Supabase-like structures (where needed) and app domain models.

// Minimal Supabase-like user shape used by the app/auth flow
export interface SupabaseLikeUser {
  id: string;
  email: string;
  created_at?: string | null;
  last_login_at?: string | null;
  user_metadata: Record<string, any> & {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    monthly_credits?: number;
    topup_credits?: number;
  };
}

// Safely split a full name into first and last name
function splitName(fullName?: string | null): { first_name: string | null; last_name: string | null } {
  if (!fullName || typeof fullName !== 'string') return { first_name: null, last_name: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first_name: null, last_name: null };
  if (parts.length === 1) return { first_name: parts[0], last_name: null };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

// Map a Laravel user payload into a Supabase-like user
// Accepts various potential Laravel shapes: direct fields or nested under `profile`.
export function mapLaravelUserToSupabaseUser(input: any): SupabaseLikeUser {
  const user = input?.data ?? input?.user ?? input ?? {};
  const source = user?.user ?? user?.data ?? user;
  const profile = source?.profile || {};

  // Prefer explicit first_name/last_name if present; otherwise derive from name
  const explicitFirst = input?.first_name ?? profile?.first_name ?? null;
  const explicitLast = input?.last_name ?? profile?.last_name ?? null;
  const explicitFull = input?.name ?? profile?.name ?? null;

  const derived = splitName(explicitFull || undefined);

  const first_name = (explicitFirst ?? derived.first_name) ?? null;
  const last_name = (explicitLast ?? derived.last_name) ?? null;
  const full_name = explicitFull ?? (first_name || last_name ? [first_name, last_name].filter(Boolean).join(' ') : null);

  // Normalize timestamps
  const created_at: string | null = input?.created_at ?? profile?.created_at ?? null;
  const last_login_at: string | null = input?.last_login_at ?? profile?.last_login_at ?? null;

  // Build user_metadata including only relevant profile fields (avoid spreading entire user)
  const { id: _omitId, email: _omitEmail, created_at: _omitCreated, updated_at: _omitUpdated, ...profileRest } = profile || {};

return {
    id: String(source?.id ?? ''),
    email: source?.email ?? '',
    created_at: source?.created_at ?? null,
    last_login_at: source?.last_login_at ?? null,
    user_metadata: {
      first_name: source?.first_name ?? source?.name ?? null,
      last_name: source?.last_name ?? null,
      
      // ADD THIS LINE:
      remaining_searches: Number(source?.remaining_searches ?? 0),
      
      monthly_credits: Number(source?.monthly_credits ?? 0),
      topup_credits: Number(source?.topup_credits ?? 0),
      plan: source?.plan ?? null,
      ...profile,
    },
  };
}

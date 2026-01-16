/**
 * Auth Helper for API Routes
 * Supports both cookie-based auth (web) and Bearer token auth (mobile)
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getAuthenticatedUser(request: NextRequest) {
  // Try Bearer token first (for mobile)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => [],
            setAll: () => {},
          },
        }
      );
      
      // Verify token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        return { user, supabase };
      }
    } catch (error) {
      console.warn('Bearer token auth failed:', error);
      // Fall through to cookie-based auth
    }
  }

  // Fallback to cookie-based auth (for web)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in server components
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { user: user || null, supabase };
}

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware checking Env Vars:");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Exists" : "MISSING");
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Exists" : "MISSING");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ CRITICAL ERROR: Supabase Keys Missing in Middleware!");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "Set" : "MISSING");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "Set" : "MISSING");
    return NextResponse.next();
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/dashboard']

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If the user is not logged in and trying to access a protected route, redirect to login
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If the user is logged in and trying to access auth pages, redirect to dashboard
  const authPages = ['/login', '/signup']
  const isAuthPage = authPages.some(page => pathname.startsWith(page))

  if (isAuthPage && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
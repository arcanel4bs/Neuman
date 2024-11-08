import { CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
        cookieOptions: {
          secure: process.env.NODE_ENV === "production"
        }
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    // Add auth state to request headers for components to access
    response.headers.set('x-auth-state', user ? 'authenticated' : 'unauthenticated');

    // Handle auth pages first
    if (['/sign-in', '/sign-up'].includes(request.nextUrl.pathname)) {
      if (user) {
        // If user is authenticated, get their active session
        const { data: session } = await supabase
          .from('console_sessions')
          .select()
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const returnTo = request.nextUrl.searchParams.get('returnTo');
        if (returnTo) {
          return NextResponse.redirect(new URL(returnTo, request.url));
        } else if (session) {
          return NextResponse.redirect(new URL(`/dashboard/${session.id}`, request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      return response;
    }

    // Protect routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/console',
      '/data-ranking',
      '/dashboard/[sessionId]',
      '/console/[sessionId]',
      '/data-ranking/[sessionId]'
    ];

    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!user) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('returnTo', request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/console/:path*',
    '/data-ranking/:path*',
    '/protected/:path*',
    '/auth/:path*',
    '/sign-in',
    '/sign-up'
  ]
}

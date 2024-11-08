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

    // Protect routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/console',
      '/data-ranking',
      '/dashboard/[sessionId]',
      '/console/[sessionId]',
      '/data-ranking/[sessionId]'
    ]
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!user) {
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('returnTo', request.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Redirect authenticated users away from auth pages
    if (['/sign-in', '/sign-up'].includes(request.nextUrl.pathname)) {
      if (user) {
        // Check if there's a return URL, otherwise go to console
        const returnTo = request.nextUrl.searchParams.get('returnTo')
        return NextResponse.redirect(new URL(returnTo || '/console', request.url))
      }
    }

    // Add user info to the response headers if available
    if (user) {
      response.headers.set('x-user-id', user.id);
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
    '/((?!_next/static|_next/image|favicon.ico|public/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";


export const updateSession = async (request: NextRequest) => {
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
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
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

    const { data: { user } } = await supabase.auth.getUser();

    // Protect /console routes
    if (request.nextUrl.pathname.startsWith('/console')) {
      if (!user) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }

    // Redirect authenticated users away from auth pages
    if (['/sign-in', '/sign-up'].includes(request.nextUrl.pathname)) {
      if (user) {
        return NextResponse.redirect(new URL('/console', request.url));
      }
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

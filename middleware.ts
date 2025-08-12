// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isProtected =
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/profesor') ||
    req.nextUrl.pathname.startsWith('/inspector') ||
    req.nextUrl.pathname.startsWith('/apoderado')

  if (isProtected && !session) {
    const url = new URL('/login', req.url)
    url.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/profesor/:path*', '/inspector/:path*', '/apoderado/:path*'],
}

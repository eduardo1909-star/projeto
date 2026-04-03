import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const isAuth = !!token
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !isAuth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}

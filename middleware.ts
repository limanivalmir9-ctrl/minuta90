import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('ks_admin_auth')?.value
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if(request.nextUrl.pathname.startsWith('/admin') && !isLoginPage){
    if(auth !== 'authenticated'){
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  if(isLoginPage && auth === 'authenticated'){
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
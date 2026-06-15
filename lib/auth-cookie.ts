import { NextResponse } from 'next/server'

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
}

export function attachBackendAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('backend_token', token, SESSION_COOKIE_OPTIONS)
}

export function clearAuthCookies(response: NextResponse) {
  for (const name of ['backend_token', 'token'] as const) {
    response.cookies.set(name, '', {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 0,
      expires: new Date(0),
    })
  }
}

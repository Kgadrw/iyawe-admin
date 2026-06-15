import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/backend-fetch'

export async function GET() {
  try {
    const backendRes = await fetchBackend('/api/auth/me')
    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (error) {
    console.error('Auth /me proxy error:', error)
    return NextResponse.json({ user: null }, { status: 502 })
  }
}

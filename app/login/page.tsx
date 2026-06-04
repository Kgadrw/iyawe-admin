'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiRequest, API_ENDPOINTS } from '@/lib/api'

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiRequest(API_ENDPOINTS.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      if (data.user?.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.')
        return
      }

      sessionStorage.setItem('adminEmail', data.user?.email || email)
      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <nav className="traffic-header">
        <div className="traffic-header-stripes" aria-hidden="true" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 traffic-header-body">
          <Link href={PUBLIC_SITE_URL} className="group inline-flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:opacity-90">
              Subizwa
            </span>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-wide">
              Found documents recovery
            </span>
          </Link>
        </div>
        <div className="traffic-header-foot" aria-hidden="true" />
      </nav>

      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 pt-12">
        <Card className="w-full max-w-sm border-gray-100 shadow-lg rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-blue-900">Admin sign in</CardTitle>
            <p className="text-sm text-blue-900/60">Subizwa administration dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-blue-900">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-blue-900 rounded-xl border-gray-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-blue-900">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-blue-900 rounded-xl border-gray-200"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

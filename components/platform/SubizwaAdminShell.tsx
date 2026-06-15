'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminPlatformNav } from './AdminPlatformNav'
import { apiRequest, API_ENDPOINTS } from '@/lib/api'

export function SubizwaAdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function verifySession() {
      try {
        const res = await apiRequest(API_ENDPOINTS.me)
        const data = await res.json()

        if (cancelled) return

        if (!data.user || data.user.role !== 'ADMIN') {
          sessionStorage.removeItem('adminEmail')
          router.replace('/login')
          return
        }

        setUserEmail(data.user.email || '')
        sessionStorage.setItem('adminEmail', data.user.email || '')
      } catch {
        if (!cancelled) router.replace('/login')
      } finally {
        if (!cancelled) setAuthChecked(true)
      }
    }

    void verifySession()

    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.logout, { method: 'POST' })
    } catch {
      /* proceed to login */
    }
    sessionStorage.removeItem('adminEmail')
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <nav className="traffic-header fixed left-0 right-0 z-50">
        <div className="traffic-header-stripes" aria-hidden="true" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 traffic-header-body">
          <div className="flex flex-col gap-3 sm:gap-4 pb-3 sm:pb-4">
            <div className="flex h-12 sm:h-16 items-center justify-between gap-3">
              <Link href="/dashboard" className="group flex flex-shrink-0 items-center">
                <div className="flex flex-col">
                  <span className="text-base sm:text-3xl font-bold text-white tracking-tight group-hover:opacity-90 transition-opacity">
                    Subizwa
                  </span>
                  <span className="text-xs text-gold-400 font-semibold hidden sm:block uppercase tracking-wide">
                    Found documents recovery
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2 sm:gap-3 text-sm">
                {userEmail ? (
                  <span className="hidden md:inline text-gold-400/90 text-xs sm:text-sm truncate max-w-[180px]">
                    {userEmail}
                  </span>
                ) : null}
                <span className="rounded-full bg-gold-400/20 border border-gold-400/40 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gold-400 uppercase tracking-wide">
                  Admin
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border-2 border-gold-400 bg-gold-400 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-900 hover:bg-gold-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            <AdminPlatformNav />
          </div>
        </div>

        <div className="border-t border-white/15 bg-[#081a30]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 text-center">
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              <span className="text-gold-400/95 font-medium">Administration</span>
              <span className="hidden sm:inline"> — </span>
              <span className="block sm:inline mt-0.5 sm:mt-0">
                Manage documents, stations, ads, and staff on the same Subizwa platform the public uses.
              </span>
            </p>
          </div>
        </div>

        <div className="traffic-header-foot" aria-hidden="true" />
      </nav>

      <div className="container mx-auto px-2 sm:px-6 lg:px-8 pt-[12rem] sm:pt-[14rem] pb-12 min-h-[calc(100vh-8rem)]">
        {children}
      </div>

      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Subizwa. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href={process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3000'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 transition-colors hover:text-blue-600"
              >
                Public homepage
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

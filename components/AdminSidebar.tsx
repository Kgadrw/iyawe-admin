'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileQuestion,
  FileCheck,
  Building2,
  Users,
  LogOut,
  Plus,
  Megaphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiRequest, API_ENDPOINTS } from '@/lib/api'
import { useRouter } from 'next/navigation'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
    action: null,
  },
  {
    title: 'Lost Documents',
    href: '/dashboard/lost',
    icon: FileQuestion,
    badge: null,
    action: null,
  },
  {
    title: 'Found Documents',
    href: '/dashboard/found',
    icon: FileCheck,
    badge: null,
    action: <Plus className="h-4 w-4" />,
  },
  {
    title: 'Handover Points',
    href: '/dashboard/handover-points',
    icon: Building2,
    badge: null,
    action: null,
  },
  {
    title: 'Ads',
    href: '/dashboard/ads',
    icon: Megaphone,
    badge: null,
    action: null,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    badge: null,
    action: null,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.logout, { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  return (
    <div className={cn(
      'flex h-screen w-64 flex-col border-r shrink-0',
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    )}>
      <div className={cn('border-b px-4 py-4', isDark ? 'border-gray-800' : 'border-gray-200')}>
        <p className={cn('text-base text-gray-900', isDark && 'text-white')}>Subizwa</p>
        <p className={cn('text-xs text-gray-500 mt-0.5', isDark && 'text-gray-400')}>Admin</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors group',
                isActive
                  ? isDark
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs text-gray-600',
                    isActive
                      ? "bg-white/20 text-white"
                      : isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                  )}>
                    {item.badge}
                  </span>
                )}
                {item.action && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                    className={cn(
                      'h-6 w-6 flex items-center justify-center text-gray-500',
                    )}
                  >
                    {item.action}
                  </button>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className={cn('px-4 py-4 border-t', isDark ? 'border-gray-800' : 'border-gray-200')}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isDark ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-50"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}


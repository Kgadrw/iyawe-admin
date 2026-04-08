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
  Shield,
  Plus,
  Bell,
  MessageSquare,
  Inbox,
  Image
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
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    badge: null,
    action: null,
  },
  {
    title: 'Ads',
    href: '/dashboard/ads',
    icon: Image,
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
      "flex h-[calc(100vh-1rem)] flex-col border-r transition-all duration-300 rounded-3xl my-2 ml-2",
      isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      "w-72"
    )}>
      {/* User Profile Section */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b rounded-t-3xl",
        isDark ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="relative">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
            "bg-gradient-to-br from-blue-500 to-purple-600"
          )}>
            A
          </div>
          <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
        </div>
        <div className="flex-1">
          <p className={cn("font-semibold text-sm", isDark ? "text-white" : "text-gray-900")}>
            Admin User
          </p>
          <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            Administrator
          </p>
        </div>
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
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group relative",
                isActive
                  ? isDark 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-500 text-white"
                  : isDark
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
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
                      // Handle action
                    }}
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-600"
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
      <div className={cn("px-4 py-4 border-t rounded-b-3xl", isDark ? "border-gray-800" : "border-gray-200")}>
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

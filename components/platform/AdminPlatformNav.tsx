'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileQuestion,
  FileCheck,
  Building2,
  Megaphone,
  Users,
  ExternalLink,
} from 'lucide-react'

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3000'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true, external: false },
  { href: '/dashboard/found', label: 'Found', icon: FileCheck, exact: false, external: false },
  { href: '/dashboard/lost', label: 'Lost', icon: FileQuestion, exact: false, external: false },
  { href: '/dashboard/handover-points', label: 'Stations', icon: Building2, exact: false, external: false },
  { href: '/dashboard/ads', label: 'Ads', icon: Megaphone, exact: false, external: false },
  { href: '/dashboard/users', label: 'Staff', icon: Users, exact: false, external: false },
  { href: PUBLIC_SITE_URL, label: 'Public site', icon: ExternalLink, exact: false, external: true },
] as const

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminPlatformNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
      {NAV_ITEMS.map((item) => {
        const active = !item.external && isActive(pathname, item.href, item.exact)
        const Icon = item.icon
        const className = cn(
          'h-9 sm:h-10 px-3 sm:px-4 rounded-full flex-shrink-0 text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5',
          active
            ? 'bg-blue-900 text-white font-semibold'
            : 'bg-white/10 text-white/90 font-medium hover:bg-white/20'
        )

        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold-400/80" />
              <span>{item.label}</span>
            </a>
          )
        }

        return (
          <Link key={item.href} href={item.href} className={className}>
            <Icon
              className={cn(
                'h-3.5 w-3.5 sm:h-4 sm:w-4',
                active ? 'text-gold-400' : 'text-gold-400/80'
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

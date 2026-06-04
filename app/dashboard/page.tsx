'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { apiRequest } from '@/lib/api'
import {
  RefreshCw,
  FileQuestion,
  FileCheck,
  Users,
  Building2,
  Megaphone,
  Link2,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: number | string
  href: string
  icon: typeof FileCheck
  iconClass: string
}) {
  return (
    <Link href={href} className="block group">
      <div className="platform-stat-card group-hover:border-blue-200">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-blue-900/60 font-medium">{label}</p>
            <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-blue-900 tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              View details →
            </p>
          </div>
          <div
            className={cn(
              'flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl',
              iconClass
            )}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function QuickNavCard({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string
  label: string
  description: string
  icon: typeof FileCheck
}) {
  return (
    <Link
      href={href}
      className="platform-stat-card flex items-start gap-3 hover:border-blue-200 group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-gold-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-blue-900 group-hover:text-blue-700">{label}</p>
        <p className="text-xs text-blue-900/60 mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalUsers: 0,
    pendingMatches: 0,
    matchedDocuments: 0,
    verifiedDocuments: 0,
  })
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const docsResponse = await apiRequest('/api/documents/latest?limit=100')
      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        const docs = docsData.documents || []
        setRecentDocuments(docs.slice(0, 8))

        setStats({
          totalLost: docs.filter((d: any) => d.type === 'lost').length,
          totalFound: docs.filter((d: any) => d.type === 'found').length,
          totalUsers: 0,
          pendingMatches: docs.filter((d: any) => !d.status || d.status === 'PENDING').length,
          matchedDocuments: docs.filter((d: any) => d.status === 'MATCHED').length,
          verifiedDocuments: docs.filter(
            (d: any) => d.status === 'VERIFIED' || d.status === 'CLAIM_PENDING'
          ).length,
        })
      }

      try {
        const usersResponse = await apiRequest('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setStats((prev) => ({
            ...prev,
            totalUsers: (usersData.users || []).length,
          }))
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const todayCount = recentDocuments.filter((d) => {
    const docDate = new Date(d.createdAt || d.reportDate)
    return docDate.toDateString() === new Date().toDateString()
  }).length

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="platform-section-title">Dashboard</h1>
          <p className="platform-section-desc">
            Click a card or icon to open found, lost, staff, stations, or ads
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="rounded-full border-gray-200 text-blue-900"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Found documents"
          value={stats.totalFound}
          href="/dashboard/found"
          icon={FileCheck}
          iconClass="text-green-600 bg-green-50"
        />
        <StatCard
          label="Lost reports"
          value={stats.totalLost}
          href="/dashboard/lost"
          icon={FileQuestion}
          iconClass="text-orange-600 bg-orange-50"
        />
        <StatCard
          label="Staff accounts"
          value={stats.totalUsers || '—'}
          href="/dashboard/users"
          icon={Users}
          iconClass="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="At station"
          value={stats.pendingMatches}
          href="/dashboard/found"
          icon={Clock}
          iconClass="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickNavCard
          href="/dashboard/found"
          label="Found documents"
          description="Manage documents at stations"
          icon={FileCheck}
        />
        <QuickNavCard
          href="/dashboard/lost"
          label="Lost reports"
          description="Legacy lost reports"
          icon={FileQuestion}
        />
        <QuickNavCard
          href="/dashboard/users"
          label="Staff accounts"
          description="Officers and institutions"
          icon={Users}
        />
        <QuickNavCard
          href="/dashboard/handover-points"
          label="Stations"
          description="Handover points & institutions"
          icon={Building2}
        />
        <QuickNavCard
          href="/dashboard/ads"
          label="Advertisements"
          description="Banner and sidebar ads"
          icon={Megaphone}
        />
        <QuickNavCard
          href="/dashboard/found"
          label="Matched / claimed"
          description={`${stats.matchedDocuments} matched · ${stats.verifiedDocuments} claimed`}
          icon={Link2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="platform-panel">
          <div className="flex flex-row items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-sm sm:text-base font-semibold text-blue-900">Recent documents</h2>
            <Link href="/dashboard/found" className="text-sm text-blue-700 hover:text-blue-900">
              View all found →
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-blue-900/50 py-4">No recent documents.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentDocuments.map((doc, index) => (
                  <li key={doc.id || index}>
                    <Link
                      href={doc.type === 'lost' ? '/dashboard/lost' : '/dashboard/found'}
                      className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-blue-50/50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-blue-900 truncate font-medium">
                          {doc.documentType?.replace(/_/g, ' ') || 'Document'}
                        </p>
                        <p className="text-blue-900/60 text-xs mt-0.5">
                          {doc.type === 'lost' ? 'Lost' : 'Found'}
                          {doc.station?.name ? ` · ${doc.station.name}` : ''}
                          {doc.foundLocation ? ` · ${doc.foundLocation}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0 text-xs text-blue-900/60">
                        <p>
                          {new Date(doc.createdAt || doc.reportDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="mt-0.5">{doc.status || '—'}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="platform-panel p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-blue-900 mb-4">Quick counts</h2>
          <dl className="divide-y divide-gray-100 text-sm">
            <Link
              href="/dashboard/found"
              className="flex justify-between py-3 gap-4 hover:bg-blue-50/50 -mx-2 px-2 rounded-lg"
            >
              <dt className="text-blue-900/60 flex items-center gap-2">
                <Clock className="h-4 w-4" /> At station (pending)
              </dt>
              <dd className="text-blue-900 font-medium tabular-nums">{stats.pendingMatches}</dd>
            </Link>
            <Link
              href="/dashboard/found"
              className="flex justify-between py-3 gap-4 hover:bg-blue-50/50 -mx-2 px-2 rounded-lg"
            >
              <dt className="text-blue-900/60 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Claimed / verified
              </dt>
              <dd className="text-blue-900 font-medium tabular-nums">{stats.verifiedDocuments}</dd>
            </Link>
            <div className="flex justify-between py-3 gap-4">
              <dt className="text-blue-900/60">Reports today</dt>
              <dd className="text-blue-900 font-medium tabular-nums">{todayCount}</dd>
            </div>
            <Link
              href="/dashboard/found"
              className="flex justify-between py-3 gap-4 hover:bg-blue-50/50 -mx-2 px-2 rounded-lg"
            >
              <dt className="text-blue-900/60 flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> Total found
              </dt>
              <dd className="text-blue-900 font-medium tabular-nums">{stats.totalFound}</dd>
            </Link>
            <Link
              href="/dashboard/lost"
              className="flex justify-between py-3 gap-4 hover:bg-blue-50/50 -mx-2 px-2 rounded-lg"
            >
              <dt className="text-blue-900/60 flex items-center gap-2">
                <FileQuestion className="h-4 w-4" /> Total lost
              </dt>
              <dd className="text-blue-900 font-medium tabular-nums">{stats.totalLost}</dd>
            </Link>
            <Link
              href="/dashboard/users"
              className="flex justify-between py-3 gap-4 hover:bg-blue-50/50 -mx-2 px-2 rounded-lg"
            >
              <dt className="text-blue-900/60 flex items-center gap-2">
                <Users className="h-4 w-4" /> Staff accounts
              </dt>
              <dd className="text-blue-900 font-medium tabular-nums">{stats.totalUsers || '—'}</dd>
            </Link>
          </dl>
        </div>
      </div>
    </div>
  )
}

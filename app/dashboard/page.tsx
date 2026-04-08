'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiRequest } from '@/lib/api'
import { 
  FileQuestion, 
  FileCheck, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  Search,
  MoreVertical,
  RefreshCw,
  ExternalLink,
  Calendar,
  Clock
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalUsers: 0,
    pendingMatches: 0,
    matchedDocuments: 0,
    verifiedDocuments: 0,
  })
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])
  const [weeklyStats, setWeeklyStats] = useState({
    lost: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
    found: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
    matched: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch latest documents
      const docsResponse = await apiRequest('/api/documents/latest?limit=100')
      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        const docs = docsData.documents || []
        setDocuments(docs)
        setRecentDocuments(docs.slice(0, 5))

        // Calculate stats from documents
        const lostCount = docs.filter((d: any) => d.type === 'lost').length
        const foundCount = docs.filter((d: any) => d.type === 'found').length
        const matchedCount = docs.filter((d: any) => d.status === 'MATCHED').length
        const verifiedCount = docs.filter((d: any) => d.status === 'VERIFIED').length
        const pendingCount = docs.filter((d: any) => d.status === 'PENDING').length

        // Calculate weekly stats
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const thisWeekLost = docs.filter((d: any) => {
          const docDate = new Date(d.createdAt || d.reportDate)
          return d.type === 'lost' && docDate >= weekAgo
        }).length
        
        const lastWeekLost = docs.filter((d: any) => {
          const docDate = new Date(d.createdAt || d.reportDate)
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          return d.type === 'lost' && docDate >= twoWeeksAgo && docDate < weekAgo
        }).length

        const thisWeekFound = docs.filter((d: any) => {
          const docDate = new Date(d.createdAt || d.reportDate)
          return d.type === 'found' && docDate >= weekAgo
        }).length
        
        const lastWeekFound = docs.filter((d: any) => {
          const docDate = new Date(d.createdAt || d.reportDate)
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          return d.type === 'found' && docDate >= twoWeeksAgo && docDate < weekAgo
        }).length

        const thisWeekMatched = docs.filter((d: any) => {
          const docDate = new Date(d.createdAt || d.reportDate)
          return d.status === 'MATCHED' && docDate >= weekAgo
        }).length
        
        const lastWeekMatched = docs.filter((d: any) => {
          const docDate = new Date(d.createdAt || d.reportDate)
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          return d.status === 'MATCHED' && docDate >= twoWeeksAgo && docDate < weekAgo
        }).length

        setWeeklyStats({
          lost: {
            current: thisWeekLost,
            change: Math.abs(thisWeekLost - lastWeekLost),
            trend: thisWeekLost >= lastWeekLost ? 'up' : 'down'
          },
          found: {
            current: thisWeekFound,
            change: Math.abs(thisWeekFound - lastWeekFound),
            trend: thisWeekFound >= lastWeekFound ? 'up' : 'down'
          },
          matched: {
            current: thisWeekMatched,
            change: Math.abs(thisWeekMatched - lastWeekMatched),
            trend: thisWeekMatched >= lastWeekMatched ? 'up' : 'down'
          },
        })

        setStats({
          totalLost: lostCount,
          totalFound: foundCount,
          totalUsers: 0,
          pendingMatches: pendingCount,
          matchedDocuments: matchedCount,
          verifiedDocuments: verifiedCount,
        })
      }

      // Fetch users count
      try {
        const usersResponse = await apiRequest('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          const users = usersData.users || []
          setStats(prev => ({ ...prev, totalUsers: users.length }))
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
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage your lost & found system</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="rounded-full"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lost Documents Card */}
          <Link href="/dashboard/lost">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all cursor-pointer hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-sm font-medium">Lost Documents</CardTitle>
                <FileQuestion className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.totalLost}</div>
                <p className="text-orange-100 text-sm">Total reported lost</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active reports</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/60" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Found Documents Card */}
          <Link href="/dashboard/found">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all cursor-pointer hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-sm font-medium">Found Documents</CardTitle>
                <FileCheck className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.totalFound}</div>
                <p className="text-green-100 text-sm">Total uploaded found</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Available for matching</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/60" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Matched Documents Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white text-sm font-medium">Matched Documents</CardTitle>
              <Users className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.matchedDocuments}</div>
              <p className="text-blue-100 text-sm">Successfully matched</p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Awaiting verification</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Row with Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lost Documents by Week */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Lost Documents by Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-2xl font-bold">{weeklyStats.lost.current}</div>
                  <div className={`flex items-center gap-1 text-sm ${weeklyStats.lost.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {weeklyStats.lost.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 rotate-180" />
                    )}
                    <span>{weeklyStats.lost.trend === 'up' ? '+' : '-'}{weeklyStats.lost.change} vs last week</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>This Week</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-16 mt-4">
                {[40, 60, 45, 70, 55, 65, weeklyStats.lost.current > 0 ? 80 : 0].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                    style={{ height: `${Math.max(height * 0.8, 10)}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Found Documents by Week */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Found Documents by Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-2xl font-bold">{weeklyStats.found.current}</div>
                  <div className={`flex items-center gap-1 text-sm ${weeklyStats.found.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {weeklyStats.found.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 rotate-180" />
                    )}
                    <span>{weeklyStats.found.trend === 'up' ? '+' : '-'}{weeklyStats.found.change} vs last week</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>This Week</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-16 mt-4">
                {[50, 70, 55, 80, 60, 75, weeklyStats.found.current > 0 ? 90 : 0].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                    style={{ height: `${Math.max(height * 0.8, 10)}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matched Documents by Week */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Matches by Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-2xl font-bold">{weeklyStats.matched.current}</div>
                  <div className={`flex items-center gap-1 text-sm ${weeklyStats.matched.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {weeklyStats.matched.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 rotate-180" />
                    )}
                    <span>{weeklyStats.matched.trend === 'up' ? '+' : '-'}{weeklyStats.matched.change} vs last week</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>This Week</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-16 mt-4">
                {[30, 50, 40, 60, 45, 55, weeklyStats.matched.current > 0 ? 70 : 0].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                    style={{ height: `${Math.max(height * 0.8, 10)}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Documents and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Documents */}
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Latest Documents</CardTitle>
                <CardDescription>Recently reported documents</CardDescription>
              </div>
              <Link href="/dashboard/lost">
                <Button variant="ghost" size="sm" className="text-xs rounded-full">
                  View All
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent documents</p>
                  </div>
                ) : (
                  recentDocuments.map((doc, index) => (
                    <Link 
                      key={doc.id || index} 
                      href={doc.type === 'lost' ? '/dashboard/lost' : '/dashboard/found'}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          doc.type === 'lost' 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {doc.type === 'lost' ? (
                            <FileQuestion className="h-5 w-5" />
                          ) : (
                            <FileCheck className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {doc.documentType?.replace(/_/g, ' ') || 'Document'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.type === 'lost' ? 'Lost' : 'Found'} • {doc.lostLocation || doc.foundLocation || 'No location'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(doc.createdAt || doc.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            doc.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' :
                            doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system metrics</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/dashboard/lost" className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Pending Matches</p>
                      <p className="text-xs text-gray-500">Awaiting verification</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">{stats.pendingMatches}</p>
                      <span className="text-xs text-yellow-600">Active</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Verified Documents</p>
                      <p className="text-xs text-gray-500">Successfully verified</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{stats.verifiedDocuments}</p>
                    <span className="text-xs text-green-600">Success</span>
                  </div>
                </div>

                <Link href="/dashboard/users" className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600">Total Users</p>
                      <p className="text-xs text-gray-500">Registered users</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-purple-600">{stats.totalUsers || 'N/A'}</p>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <FileQuestion className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Reports Today</p>
                      <p className="text-xs text-gray-500">Last 24 hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">
                      {recentDocuments.filter(d => {
                        const docDate = new Date(d.createdAt || d.reportDate)
                        const today = new Date()
                        return docDate.toDateString() === today.toDateString()
                      }).length}
                    </p>
                    <span className="text-xs text-green-600">Today</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

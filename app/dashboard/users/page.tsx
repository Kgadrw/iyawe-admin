'use client'

import { AdminStaffManager } from '@/components/AdminStaffManager'

export default function UsersPage() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl">
      <div>
        <h1 className="platform-section-title">Staff accounts</h1>
        <p className="platform-section-desc">
          Create login credentials for police officers and institutions. They use staff login on the public Subizwa site.
        </p>
      </div>
      <AdminStaffManager />
    </div>
  )
}

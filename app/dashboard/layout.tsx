import { SubizwaAdminShell } from '@/components/platform/SubizwaAdminShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SubizwaAdminShell>{children}</SubizwaAdminShell>
}

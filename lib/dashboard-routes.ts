export const ADMIN_CREATABLE_ROLES = ['OFFICER', 'INSTITUTION'] as const

export const ADMIN_STAFF_ROLE_OPTIONS = [
  { value: 'OFFICER' as const, label: 'Police officer' },
  { value: 'INSTITUTION' as const, label: 'Institution' },
] as const

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  OFFICER: 'Officer',
  INSTITUTION: 'Institution',
  USER: 'Public',
}

export function registerRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role
}

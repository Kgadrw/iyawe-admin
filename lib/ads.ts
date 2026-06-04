export const AD_PLACEMENTS = ['BANNER_TOP', 'SIDEBAR_RIGHT'] as const
export type AdPlacement = (typeof AD_PLACEMENTS)[number]

export const AD_PLACEMENT_LABELS: Record<AdPlacement, string> = {
  BANNER_TOP: 'Below header (horizontal — max 2)',
  SIDEBAR_RIGHT: 'Right sidebar (vertical)',
}

export const BANNER_TOP_MAX_ACTIVE = 2

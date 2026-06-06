/**
 * API Configuration for Admin Dashboard
 * All /api/* requests are proxied to the Express backend (see next.config.ts rewrites).
 * Use empty string for same-origin proxying so auth cookies work correctly.
 */

// Use same-origin (relative URLs) — Next.js rewrites handle proxying to backend
export const API_BASE_URL = ''

/**
 * Make an API request with proper configuration
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies for authentication
    headers: isFormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        },
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })
    return response
  } catch (error) {
    console.error('API Request failed:', error)
    throw new Error(`Failed to connect to the API server. Please try again.`)
  }
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  
  // Admin endpoints (to be created)
  adminStats: '/api/admin/stats',
  adminDocuments: '/api/admin/documents',
  adminUsers: '/api/admin/users',
  adminReports: (type: 'lost' | 'found') => `/api/admin/reports/${type}`,
  adminReport: (type: 'lost' | 'found', id: string) => `/api/admin/reports/${type}/${id}`,
  adminUpdateStatus: (reportId: string) => `/api/admin/reports/${reportId}/status`,
  adminAds: '/api/admin/ads',
  adminAd: (id: string) => `/api/admin/ads/${id}`,
}

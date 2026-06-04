/**
 * API Configuration for Admin Dashboard
 * Connects to the backend Express.js server
 */

// Backend API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
    throw new Error(`Failed to connect to backend server at ${API_BASE_URL}. Make sure the backend is running.`)
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

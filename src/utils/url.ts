import type { ChartPageType, SiteId } from '../types'

const BASENAME = '/AgriNET'

// Page number to URL path mapping
const PAGE_PATHS: Record<number, string> = {
  1: '/map',
  2: '/chart',
  3: '/virtual-valve',
  4: '/add-valve',
  5: '/comments',
  6: '/add-unit',
  7: '/datalist',
}

// URL path to page number mapping
const PATH_PAGES: Record<string, number> = {
  '/map': 1,
  '/layers': 1,
  '/chart': 2,
  '/virtual-valve': 3,
  '/add-valve': 4,
  '/comments': 5,
  '/add-unit': 6,
  '/datalist': 7,
}

// Page 0 routes handled by React Router
const ROUTER_PATHS = ['/menu', '/login', '/info', '/budget']

interface UrlState {
  siteId?: SiteId | string
  chartPageType?: ChartPageType
}

export function buildUrl(path: string, params?: Record<string, string>): string {
  let url = BASENAME + path
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value) searchParams.set(key, value)
    }
    const qs = searchParams.toString()
    if (qs) url += '?' + qs
  }
  return url
}

export function parseCurrentUrl(): { path: string; params: URLSearchParams } {
  const fullPath = window.location.pathname.replace(BASENAME, '') || '/'
  return {
    path: fullPath,
    params: new URLSearchParams(window.location.search),
  }
}

export function pageToUrl(page: number, state: UrlState): string {
  if (page === 0) return '' // React Router handles page 0

  const basePath = PAGE_PATHS[page]
  if (!basePath) return ''

  const params: Record<string, string> = {}

  if (page === 2 && state.siteId) {
    params.siteId = String(state.siteId)
    if (state.chartPageType) params.type = state.chartPageType
  }

  if ((page === 3 || page === 4) && state.siteId) {
    params.siteId = String(state.siteId)
  }

  return buildUrl(basePath, Object.keys(params).length > 0 ? params : undefined)
}

export function pathToPage(path: string): number | undefined {
  const page = PATH_PAGES[path]
  if (page !== undefined) return page

  if (ROUTER_PATHS.includes(path)) return 0

  return undefined
}

export function isDeepLink(path: string): boolean {
  return path !== '/' && path !== '/menu' && path !== '/login' && path !== ''
}

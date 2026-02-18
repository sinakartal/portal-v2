/**
 * Subdomain detection utility
 * corporate.domain.com → 'corporate'
 * restaurant.domain.com → 'restaurant'
 * ship.domain.com → 'ship'
 * admin.domain.com or domain.com → 'admin' (default)
 */

export function getSubdomain() {
  const hostname = window.location.hostname

  // localhost development: check for subdomain pattern like corporate.localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const parts = hostname.split('.')
    if (parts.length > 1 && parts[0] !== 'www') {
      return parts[0]
    }
    // Also check URL search params for dev convenience: ?portal=corporate
    const params = new URLSearchParams(window.location.search)
    const portal = params.get('portal')
    if (portal) return portal

    return 'admin'
  }

  // Production: extract subdomain
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    const sub = parts[0]
    if (sub === 'www' || sub === 'admin') return 'admin'
    return sub
  }

  return 'admin'
}

export function isPortal(name) {
  return getSubdomain() === name
}

export function getPortalType() {
  const sub = getSubdomain()
  const portals = ['corporate', 'restaurant', 'ship']
  return portals.includes(sub) ? sub : 'admin'
}

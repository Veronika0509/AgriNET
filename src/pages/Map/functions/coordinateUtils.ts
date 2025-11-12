/**
 * Coordinate and map utility functions
 * Pure functions for coordinate manipulation and calculations
 */

export interface Coordinate {
  lat: number
  lng: number
}

/**
 * Rounds a coordinate value to 7 decimal places
 */
export const roundCoordinate = (value: number): number => {
  return Math.round(value * 10000000) / 10000000
}

/**
 * Rounds both latitude and longitude coordinates
 */
export const roundCoordinates = (lat: number, lng: number): Coordinate => {
  return {
    lat: roundCoordinate(lat),
    lng: roundCoordinate(lng),
  }
}

/**
 * Calculates Euclidean distance between two coordinates
 * Note: This is a simplified distance calculation, not geodesic distance
 */
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  return Math.sqrt(Math.pow(coord1.lat - coord2.lat, 2) + Math.pow(coord1.lng - coord2.lng, 2))
}

/**
 * Finds the closest site to a given coordinate from a list of sites
 */
export const findClosestSite = <T extends Coordinate>(
  targetCoord: Coordinate,
  sites: T[],
): T | null => {
  if (!sites || sites.length === 0) {
    return null
  }

  let closestSite = sites[0]
  let minDistance = Number.MAX_VALUE

  sites.forEach((site) => {
    if (site.lat !== undefined && site.lng !== undefined) {
      const distance = calculateDistance(targetCoord, site)
      if (distance < minDistance) {
        minDistance = distance
        closestSite = site
      }
    }
  })

  return closestSite
}
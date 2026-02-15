/**
 * Utility functions for managing chart preference cookies
 */

const COOKIE_EXPIRY_DAYS = 365; // 1 year

interface ChartPreferences {
  dateDifferenceInDays: string;
  selectedTab: 'days' | 'years';
}

/**
 * Set a cookie with expiry date
 */
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Save chart date range preferences to cookies
 */
export function saveChartPreferences(preferences: ChartPreferences): void {
  setCookie('chartDateDifference', preferences.dateDifferenceInDays, COOKIE_EXPIRY_DAYS);
  setCookie('chartSelectedTab', preferences.selectedTab, COOKIE_EXPIRY_DAYS);
}

/**
 * Load chart date range preferences from cookies
 * Returns default values if cookies don't exist
 */
export function loadChartPreferences(): ChartPreferences {
  const dateDifferenceInDays = getCookie('chartDateDifference') || '14';
  const selectedTab = (getCookie('chartSelectedTab') as 'days' | 'years') || 'days';

  return {
    dateDifferenceInDays,
    selectedTab,
  };
}

/**
 * Save layer selection preferences to localStorage
 * Stores per user and per site
 */
export function saveLayerPreferences(userId: string | number, siteName: string, checkedLayers: { [key: string]: boolean }): void {
  try {
    // Convert userId to number if it's a branded type
    const userIdValue = typeof userId === 'object' ? String(userId) : userId;
    const key = `layerPreferences_${userIdValue}_${siteName}`;
    const value = JSON.stringify(checkedLayers);
    localStorage.setItem(key, value);
    console.log('[Layer Preferences] Saved:', { key, userId: userIdValue, siteName, checkedLayers });
  } catch (error) {
    console.error('Failed to save layer preferences:', error);
  }
}

/**
 * Load layer selection preferences from localStorage
 * Returns saved preferences or null if not found
 */
export function loadLayerPreferences(userId: string | number, siteName: string): { [key: string]: boolean } | null {
  try {
    // Convert userId to number if it's a branded type
    const userIdValue = typeof userId === 'object' ? String(userId) : userId;
    const key = `layerPreferences_${userIdValue}_${siteName}`;
    const saved = localStorage.getItem(key);
    console.log('[Layer Preferences] Loading:', { key, userId: userIdValue, siteName, saved });
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('[Layer Preferences] Loaded:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load layer preferences:', error);
  }
  console.log('[Layer Preferences] No saved preferences found');
  return null;
}
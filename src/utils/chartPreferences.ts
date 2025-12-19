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
/**
 * Browser localStorage utilities — adapted from mobile's AsyncStorage wrapper
 * Synchronous API since browser localStorage is synchronous
 */

/**
 * Save data to localStorage
 */
export const setItem = (key, value) => {
  try {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

/**
 * Get data from localStorage
 */
export const getItem = (key) => {
  try {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as string if not JSON
      }
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Remove a specific item from localStorage
 */
export const removeItem = (key) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

/**
 * Clear everything from localStorage and redirect to signin
 */
export const clearAll = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      // Refresh token cookie is HttpOnly — cleared by the backend on logout
      window.location.replace('/signin');
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};


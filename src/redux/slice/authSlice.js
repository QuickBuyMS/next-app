/**
 * Auth slice — local auth state only
 * API calls are handled by RTK Query (services/authApi.js)
 * 
 * Access token lives ONLY in Redux state (memory) — never persisted.
 * Refresh token lives in an HttpOnly cookie set by the backend — never in JS.
 */
import { createSlice } from '@reduxjs/toolkit';
import { removeItem } from '@/utils/localStorage';

const initialState = {
  accessToken: null,
  isAuthenticated: false,
  isHydrating: true, // true while we attempt a silent refresh on page load
  profile: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, profile } = action.payload;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      if (profile) {
        state.profile = profile;
      }
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.profile = null;
      state.error = null;
      // Clear persisted user data from localStorage
      removeItem('userData');
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    hydrateAuth: (state, action) => {
      // Called after a successful silent refresh on page load
      const { accessToken, profile } = action.payload;
      if (accessToken) {
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        state.profile = profile;
      }
      state.isHydrating = false;
    },
    hydrateComplete: (state) => {
      // Called when silent refresh fails (no session) — stop showing loader
      state.isHydrating = false;
    },
  },
});

export const { setCredentials, setProfile, logout, setAuthError, hydrateAuth, hydrateComplete } =
  authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentToken = (state) => state.auth.accessToken;
export const selectProfile = (state) => state.auth.profile;
export const selectAuthError = (state) => state.auth.error;
export const selectIsHydrating = (state) => state.auth.isHydrating;

export default authSlice.reducer;

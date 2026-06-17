/**
 * Global slice — loading state, language
 * Adapted from mobile's global.ts — simplified for web (no thunk listeners needed for RTK Query)
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'english',
  loading: false,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
  },
});

export const { setLoading, setLanguage } = globalSlice.actions;

// Selectors
export const getGlobalLoader = (state) => state.global.loading;
export const getGlobalLanguage = (state) => state.global.language;

export default globalSlice.reducer;

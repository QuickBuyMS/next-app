/**
 * Snackbar/toast notification slice
 * Adapted from mobile's snackbarSlice.ts
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visible: false,
  message: '',
  type: null, // 'success' | 'error' | 'info'
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.visible = true;
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
    },
    hideSnackbar: (state) => {
      state.visible = false;
      state.message = '';
      state.type = null;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;

// Selectors
export const selectSnackbar = (state) => state.snackbar;

export default snackbarSlice.reducer;

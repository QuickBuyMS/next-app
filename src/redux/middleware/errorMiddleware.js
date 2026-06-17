import { isRejectedWithValue } from '@reduxjs/toolkit';
import { showSnackbar } from '../slice/snackbarSlice';

/**
 * Global Error Handling Middleware for RTK Query
 * This middleware catches all rejected actions from any RTK Query service 
 * (authApi, catalogueApi, orderApi, etc.) and automatically displays an error snackbar.
 */
export const rtkQueryErrorLogger = (api) => (next) => (action) => {
  // RTK Query dispatches rejected actions with `isRejectedWithValue` when a query/mutation fails
  if (isRejectedWithValue(action)) {
    console.error('API Error:', action.payload);
    
    // Extract error message based on your API response structure
    const errorMessage =
      action.payload?.data?.message ||
      action.error?.message ||
      'An unexpected error occurred. Please try again.';

    // Dispatch the snackbar action to show the error globally
    api.dispatch(
      showSnackbar({
        message: errorMessage,
        type: 'error',
      })
    );
  }

  return next(action);
};

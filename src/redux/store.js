/**
 * Redux store — configureStore with RTK Query middleware
 * Replaces mobile's store.ts — uses authApi.middleware instead of custom listener middleware
 */
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/services/authApi';
import { orderApi } from '@/services/orderApi';
import { catalogueApi } from '@/services/catalogueApi';
import authReducer from './slice/authSlice';
import globalReducer from './slice/globalSlice';
import snackbarReducer from './slice/snackbarSlice';
import checkoutReducer from './slice/checkoutSlice';
import { rtkQueryErrorLogger } from './middleware/errorMiddleware';
import { injectStore } from '@/utils/axiosBaseQuery';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [catalogueApi.reducerPath]: catalogueApi.reducer,
    auth: authReducer,
    global: globalReducer,
    snackbar: snackbarReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, orderApi.middleware, catalogueApi.middleware, rtkQueryErrorLogger),
});

injectStore(store);

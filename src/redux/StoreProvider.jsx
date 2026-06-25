'use client';

/**
 * StoreProvider — client component wrapper for Redux Provider
 * 
 * On mount, attempts a "silent refresh" by calling the backend directly.
 * withCredentials: true ensures the HttpOnly refresh token cookie is sent.
 * If the refresh succeeds, the new access token is stored in Redux state.
 * If it fails, the user is treated as unauthenticated.
 */
import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect, useState } from 'react';
import { hydrateAuth, hydrateComplete } from './slice/authSlice';
import { getItem } from '@/utils/localStorage';
import axios from 'axios';

import { environmentConfig } from '@/configs/envConfig';

const AUTH_BACKEND_URL = environmentConfig.API_ENDPOINT_URL;

export default function StoreProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const silentRefresh = async () => {
      try {
        // Attempt to get a fresh access token using the HttpOnly refresh cookie
        const res = await axios.post(
          `${AUTH_BACKEND_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const accessToken = res.data?.accessToken;

        // Try to get profile from localStorage (fast hydration)
        let profile = null;
        try {
          const userData = getItem('userData');
          if (userData) {
            profile = typeof userData === 'string' ? JSON.parse(userData) : userData;
          }
        } catch {
          // ignore parse errors
        }

        if (accessToken) {
          store.dispatch(hydrateAuth({ accessToken, profile }));
        } else {
          store.dispatch(hydrateComplete());
        }
      } catch {
        // No valid session — user is unauthenticated
        store.dispatch(hydrateComplete());
      } finally {
        setIsReady(true);
      }
    };

    silentRefresh();
  }, []);

  return (
    <Provider store={store}>
      {isReady ? children : null}
    </Provider>
  );
}

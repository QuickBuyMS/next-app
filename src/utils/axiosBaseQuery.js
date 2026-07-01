/**
 * Custom baseQuery wrapping axios for RTK Query
 * 
 * Access token is read from Redux state (memory only).
 * Refresh token is in an HttpOnly cookie — the browser sends it automatically
 * to the backend with withCredentials: true (same-site, different port).
 */
import axios from 'axios';
import { clearAll } from '@/utils/localStorage';
import { endpoints } from '@/utils/endpoints';
import { setCredentials, logout } from '@/redux/slice/authSlice';

let store;
export const injectStore = (_store) => {
  store = _store;
};

// ---------- Port Router (same microservice pattern as mobile) ----------
const LOCALHOST = 'localhost';

const PORT_ROUTER = [
  {
    match: /^\/api\/auth(\/|$)/,
    baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || `http://${LOCALHOST}:7001`,
  },
  {
    match: /^\/api\/catalogue(\/|$)/,
    baseURL: process.env.NEXT_PUBLIC_CATALOGUE_SERVICE_URL || `http://${LOCALHOST}:7002`,
  },
  {
    match: /^\/api\/order(\/|$)/,
    baseURL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || `http://${LOCALHOST}:7000`,
  },
  {
    match: /^\/graphql(\/|$)/,
    baseURL: process.env.NEXT_PUBLIC_GRAPHQL_URL || `http://${LOCALHOST}:7000`, // The graphql request appending /graphql handles the rest, but wait, the profileApi actually makes the full URL, let's keep this as the base host if used, though graphql isn't used via baseQuery with proxy usually unless configured that way.
  },
];

const resolveBaseUrl = (url) => {
  if (!url) throw new Error('Request URL is required to resolve baseURL');
  const rule = PORT_ROUTER.find((r) => r.match.test(url));
  if (!rule) throw new Error(`No baseURL rule matched for: ${url}`);
  return rule.baseURL;
};

// ---------- Axios instance ----------
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token from Redux state + resolve baseURL
axiosInstance.interceptors.request.use(
  (config) => {
    config.baseURL = resolveBaseUrl(config.url);

    // Send cookies for auth routes (HttpOnly refresh token)
    if (/^\/api\/auth(\/|$)/.test(config.url)) {
      config.withCredentials = true;
    }

    // Read access token from Redux state (memory only)
    const accessToken = store?.getState()?.auth?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Mutex for token refresh (prevents concurrent refreshes) ----------
let refreshPromise = null;

export const refreshAuthToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .post(
      `${resolveBaseUrl(endpoints.auth.refreshToken)}${endpoints.auth.refreshToken}`,
      {},
      { withCredentials: true } // browser auto-sends HttpOnly cookie
    )
    .then((res) => {
      const newAccessToken = res.data?.accessToken;
      if (newAccessToken) {
        // Update Redux state with the new access token
        store?.dispatch(setCredentials({ accessToken: newAccessToken }));
      }
      return newAccessToken;
    })
    .catch(() => {
      // Refresh failed — session is invalid, force logout
      store?.dispatch(logout());
      clearAll();
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      return '';
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// ---------- RTK Query base query ----------
const axiosBaseQuery =
  () =>
    async ({ url, method, data, params, headers }) => {
      try {
        const result = await axiosInstance({
          url,
          method,
          data,
          params,
          headers,
        });
        return { data: result.data };
      } catch (axiosError) {
        return {
          error: {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
          },
        };
      }
    };

// ---------- Re-auth wrapper ----------
const baseQuery = axiosBaseQuery();

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    try {
      const newAccessToken = await refreshAuthToken();
      if (newAccessToken) {
        // Retry the original request with the new token
        result = await baseQuery(
          {
            ...args,
            headers: {
              ...args.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
          api,
          extraOptions
        );
      }
    } catch {
      store?.dispatch(logout());
      clearAll();
    }
  }

  return result;
};

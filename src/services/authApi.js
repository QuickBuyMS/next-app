/**
 * Auth API — RTK Query createApi
 * Auto-generated hooks: useLoginMutation, useSignupMutation, useGetProfileQuery, useLogoutMutation
 * 
 * Fully client-side — all calls go directly to the backend.
 * Access token → Redux state only (never persisted)
 * Refresh token → HttpOnly cookie set by backend (never touched by JS)
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/utils/axiosBaseQuery';
import { endpoints } from '@/utils/endpoints';
import { setCredentials, logout as logoutAction, setProfile } from '@/redux/slice/authSlice';
import { setItem } from '@/utils/localStorage';
import { withTryCatch } from '@/utils/rtkQueryWrapper';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Profile'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: endpoints.auth.login,
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Auth'],
      onQueryStarted: withTryCatch(async (arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        const tokens = data?.data?.tokens;
        const user = data?.data?.user;

        if (tokens) {
          // Persist user data to localStorage (for profile hydration on reload)
          setItem('userData', JSON.stringify(user));

          // Update Redux state — only accessToken (refresh token is in HttpOnly cookie)
          dispatch(
            setCredentials({
              accessToken: tokens.accessToken,
              profile: user,
            })
          );
        }
      }),
    }),

    signup: builder.mutation({
      query: (userData) => ({
        url: endpoints.auth.signup,
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['Auth'],
      onQueryStarted: withTryCatch(async (arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        const tokens = data?.data?.tokens;
        const user = data?.data?.user;

        if (tokens) {
          setItem('userData', JSON.stringify(user));

          dispatch(
            setCredentials({
              accessToken: tokens.accessToken,
              profile: user,
            })
          );
        }
      }),
    }),

    getProfile: builder.query({
      query: () => ({
        url: endpoints.auth.profile,
        method: 'GET',
      }),
      providesTags: ['Profile'],
      onQueryStarted: withTryCatch(async (arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setProfile(data?.data));
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: endpoints.auth.logout,
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Profile'],
      onQueryStarted: withTryCatch(async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logoutAction());
        }
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi;

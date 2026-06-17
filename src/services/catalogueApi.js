/**
 * Catalogue API — RTK Query createApi
 * Provides hooks for product listing and product details
 * Auto-generated hooks: useGetProductsQuery, useGetProductDetailsQuery
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/utils/axiosBaseQuery';
import { endpoints } from '@/utils/endpoints';

export const catalogueApi = createApi({
  reducerPath: 'catalogueApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products', 'ProductDetails'],
  endpoints: (builder) => ({
    // ---------- Products List ----------
    getProducts: builder.query({
      query: (params) => ({
        url: endpoints.catalogue.listproducts,
        method: 'GET',
        params,
      }),
      providesTags: ['Products'],
    }),

    // ---------- Single Product Details ----------
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${endpoints.catalogue.productDetails}${productId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'ProductDetails', id }],
    }),

    // ---------- Categories ----------
    getCategories: builder.query({
      query: () => ({
        url: endpoints.catalogue.allCategories,
        method: 'GET',
      }),
    }),

    // ---------- Filter Products ----------
    filterProducts: builder.query({
      query: (filterData) => ({
        url: endpoints.catalogue.filterProducts,
        method: 'POST',
        body: filterData,
      }),
      providesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetCategoriesQuery,
  useFilterProductsQuery,
} = catalogueApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/utils/axiosBaseQuery';
import { endpoints } from '@/utils/endpoints';
import { withTryCatch } from '@/utils/rtkQueryWrapper';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Cart', 'Wishlist', 'Orders', 'Addresses'],
  endpoints: (builder) => ({
    // ---------- Cart ----------
    getCartDetails: builder.query({
      query: (userId) => ({
        url: endpoints.order.cartDetails,
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),

    updateCart: builder.mutation({
      query: ({ userId, productId, quantity }) => ({
        url: endpoints.order.updateCart,
        method: 'PATCH',
        data: { product_id: productId, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    // ---------- Wishlist ----------
    getWishlistDetails: builder.query({
      query: (userId) => ({
        url: endpoints.order.wishlistDetails,
        method: 'GET',
      }),
      providesTags: ['Wishlist'],
    }),

    updateWishlist: builder.mutation({
      query: ({ userId, productId }) => ({
        url: endpoints.order.updateWishlist,
        method: 'PATCH',
        data: { product_id: productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // ---------- Orders ----------
    getUserOrders: builder.query({
      query: (userId) => ({
        url: endpoints.order.userOrders,
        method: 'GET',
      }),
      providesTags: ['Orders'],
    }),

    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${endpoints.order.orderDetails}/${orderId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: endpoints.order.placeOrder,
        method: 'POST',
        data: orderData,
      }),
      // Placing an order empties the cart and creates a new order
      invalidatesTags: ['Orders', 'Cart'],
    }),

    cancelOrder: builder.mutation({
      query: ({ orderId, orderItemId }) => ({
        url: endpoints.order.cancelOrder,
        method: 'POST',
        data: { order_id: orderId, order_item_id: orderItemId },
      }),
      invalidatesTags: ['Orders'],
    }),

    // ---------- Addresses ----------
    getAddresses: builder.query({
      query: (userId) => ({
        url: endpoints.order.getAddress,
        method: 'GET',
      }),
      providesTags: ['Addresses'],
    }),

    addAddress: builder.mutation({
      query: ({ userId, ...addressData }) => ({
        url: endpoints.order.addAddress,
        method: 'POST',
        data: addressData,
      }),
      invalidatesTags: ['Addresses'],
    }),

    updateAddress: builder.mutation({
      query: ({ addressId, ...addressData }) => ({
        url: `${endpoints.order.updateAddress}/${addressId}`,
        method: 'PUT',
        data: addressData,
      }),
      invalidatesTags: ['Addresses'],
    }),
  }),
});

export const {
  useGetCartDetailsQuery,
  useUpdateCartMutation,
  useGetWishlistDetailsQuery,
  useUpdateWishlistMutation,
  useGetUserOrdersQuery,
  useGetOrderDetailsQuery,
  usePlaceOrderMutation,
  useCancelOrderMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
} = orderApi;

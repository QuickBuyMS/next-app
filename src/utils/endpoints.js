// API endpoint paths — direct port from mobile endpoints.ts
export const endpoints = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    refreshToken: '/api/auth/refresh',
    profile: '/api/auth/myprofile',
    logout: '/api/auth/logout',
  },
  catalogue: {
    listproducts: '/api/catalogue/products',
    productDetails: '/api/catalogue/',
    allCategories: '/api/catalogue/categories',
    allSubCategories: '/api/catalogue/subcategories',
    subCategoriesByCategory: '/api/catalogue/subcategories',
    filterProducts: '/api/catalogue/products/filter',
  },
  order: {
    placeOrder: '/api/order/place-order',
    orderDetails: '/api/order/order-details',
    userOrders: '/api/order/all-order',
    cancelOrder: '/api/order/cancel-order',
    getAddress: '/api/order/addresses',
    addAddress: '/api/order/add-address',
    updateAddress: '/api/order/update-address',
    cartDetails: '/api/order/cartdetails',
    updateCart: '/api/order/updatecart',
    wishlistDetails: '/api/order/wishlistdetails',
    updateWishlist: '/api/order/updatewishlist',
  },
};

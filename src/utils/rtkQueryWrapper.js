/**
 * RTK Query onQueryStarted wrapper
 * A middleware utility that catches promise rejections from `queryFulfilled`.
 * By wrapping your onQueryStarted lifecycle methods with this, you avoid unhandled promise
 * rejections without having to write repetitive try/catch blocks in every endpoint.
 */
export const withTryCatch = (handler) => async (arg, api) => {
  try {
    await handler(arg, api);
  } catch (err) {
    // Errors (e.g. from `await queryFulfilled`) are caught here silently.
    // Real error handling is done by RTK Query's slice error state and the global rtkQueryErrorLogger middleware.
  }
};

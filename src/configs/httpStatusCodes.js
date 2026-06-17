// Common HTTP Status Codes Object — direct port from mobile
export const HTTP_STATUS_CODES = {
  // Success
  200: 'OK - The request was successful.',
  201: 'Created - The request was successful and a resource was created.',
  202: 'Accepted - The request has been accepted for processing, but not completed.',
  204: 'No Content - The request was successful but there is no content to return.',

  // Client Errors
  400: 'Bad Request - The server could not understand the request due to invalid syntax.',
  401: 'Unauthorized - Authentication is required or has failed.',
  403: 'Forbidden - The client does not have access rights to the content.',
  404: 'Not Found - The server can not find the requested resource.',
  405: 'Method Not Allowed - The request method is known by the server but not supported.',
  409: 'Conflict - The request could not be completed due to a conflict with the current state.',
  422: 'Unprocessable Entity - The server understands the content type and syntax, but unable to process.',

  // Server Errors
  500: 'Internal Server Error - The server has encountered a situation it does not know how to handle.',
  501: 'Not Implemented - The request method is not supported by the server.',
  502: 'Bad Gateway - The server received an invalid response from the upstream server.',
  503: 'Service Unavailable - The server is not ready to handle the request.',
  504: 'Gateway Timeout - The server is acting as a gateway and cannot get a response in time.',

  // Redirection (optional)
  301: 'Moved Permanently - The requested resource has been assigned a new permanent URI.',
  302: 'Found - The requested resource resides temporarily under a different URI.',
};

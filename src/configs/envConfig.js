/**
 * Environment configuration — adapted from mobile envConfig.ts
 * Reads from NEXT_PUBLIC_* environment variables instead of Expo manifest
 */

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'dev';

const dev = {
  API_ENDPOINT_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7001',
  API_IMAGE_BASE_URL: 'https://dummyjson.com/image/',
  STATIC_IMAGE_BASE_URL: 'https://dummyjson.com/image/',
  API_ENDPOINT_NAME: 'MJUAT',
};

const stag = {
  API_ENDPOINT_URL: 'https://dummyjson.com',
  API_IMAGE_BASE_URL: '',
  STATIC_IMAGE_BASE_URL: '',
  API_ENDPOINT_NAME: 'STAG',
};

const prod = {
  API_ENDPOINT_URL: 'https://dummyjson.com',
  API_IMAGE_BASE_URL: '',
  STATIC_IMAGE_BASE_URL: '',
  API_ENDPOINT_NAME: 'PROD',
};

const getEnv = () => {
  switch (APP_ENV) {
    case 'dev':
      return dev;
    case 'prod':
      return prod;
    case 'stag':
      return stag;
    default:
      return stag;
  }
};

export const environmentConfig = getEnv();

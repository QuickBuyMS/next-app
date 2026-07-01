import { refreshAuthToken } from '@/utils/axiosBaseQuery';

/**
 * Profile GraphQL Service — Simple fetch-based client
 *
 * Uses plain fetch() to call the GraphQL endpoint on the order-app.
 * Token is passed manually from the caller (component reads it from Redux).
 */

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:7000/graphql';

const ALL_PROFILE_FIELDS = `
  user_id
  name
  email
  phone
  points
  role
  created_at
  updated_at
`;

const buildGetProfileQuery = (fields) => {
  const selectedFields = (fields && fields.length > 0) ? fields.join("\n") : ALL_PROFILE_FIELDS;
  return `
    query GetProfile {
      getProfile {
        status
        statusCode
        message
        data {
          ${selectedFields}
        }
      }
    }
  `;
};

const UPDATE_PROFILE = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      status
      statusCode
      message
      data {
        user_id
        name
        email
        phone
        points
        role
        created_at
        updated_at
      }
    }
  }
`;

/**
 * Sends a GraphQL request with auth token.
 */
async function graphqlRequest(query, variables = {}, token, isRetry = false) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  // Check if GraphQL resolver returned a 401 statusCode
  if (json.data) {
    const operationName = Object.keys(json.data)[0];
    const responsePayload = json.data[operationName];

    if (responsePayload?.statusCode === 401 && !isRetry) {
      try {
        const newAccessToken = await refreshAuthToken();
        if (newAccessToken) {
          // Retry the request with the new token
          return await graphqlRequest(query, variables, newAccessToken, true);
        }
      } catch (err) {
        // Refresh failed, strictly logout is handled in axiosBaseQuery
      }
    }
  }

  return json.data;
}

/**
 * Fetch the authenticated user's profile.
 * @param {string} token - JWT access token
 * @param {string[]} fields - Optional array of fields to fetch
 */
export async function fetchProfile(token, fields) {
  const query = buildGetProfileQuery(fields);
  const data = await graphqlRequest(query, {}, token);
  return data.getProfile;
}

/**
 * Update the authenticated user's profile.
 * @param {object} input - { name?, email?, phone? }
 * @param {string} token - JWT access token
 */
export async function updateProfileApi(input, token) {
  const data = await graphqlRequest(UPDATE_PROFILE, { input }, token);
  return data.updateProfile;
}

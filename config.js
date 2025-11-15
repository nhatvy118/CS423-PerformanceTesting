// k6 Configuration - Shared settings for all tests

// Base URL configuration
// For local testing: http://localhost:8091
// For production: https://api.practicesoftwaretesting.com
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8091';

// API version prefix (no prefix needed - routes are at root)
export const API_PREFIX = '';

// Test user credentials (adjust based on your test data)
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'customer@practicesoftwaretesting.com',
  password: __ENV.TEST_PASSWORD || 'welcome01',
};

// Common headers
export const COMMON_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// Helper function to get auth headers
export function getAuthHeaders(token) {
  return {
    ...COMMON_HEADERS,
    'Authorization': `Bearer ${token}`,
  };
}

// Helper function to get full URL
export function getUrl(endpoint) {
  return `${BASE_URL}${API_PREFIX}${endpoint}`;
}

// Common thresholds
export const COMMON_THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'], // Less than 1% errors
  checks: ['rate>0.95'], // 95% of checks should pass
};


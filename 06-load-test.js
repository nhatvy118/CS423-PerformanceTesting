import http from 'k6/http';
import { check, sleep } from 'k6';
import { COMMON_HEADERS, getUrl, COMMON_THRESHOLDS } from './config.js';

// Load Test - Gradual ramp-up to test system under normal load
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Ramp up to 50 users over 1 minute
  ],
  thresholds: {
    ...COMMON_THRESHOLDS,
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};

export default function () {
  // Load test on multiple API endpoints - rotate through different endpoints
  const endpoints = [
    '/status',
    '/products',
    '/categories',
    '/brands',
  ];

  // Select endpoint based on virtual user ID for distribution
  const endpoint = endpoints[__VU % endpoints.length];
  
  const response = http.get(getUrl(endpoint), {
    headers: COMMON_HEADERS,
  });
  
  check(response, {
    [`${endpoint} returns 200`]: (r) => r.status === 200,
    [`${endpoint} response time < 1000ms`]: (r) => r.timings.duration < 1000,
  });
  
  sleep(1); // Think time between requests
}


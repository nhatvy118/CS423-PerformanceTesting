import http from 'k6/http';
import { check, sleep } from 'k6';
import { COMMON_HEADERS, getUrl, COMMON_THRESHOLDS } from './config.js';

// Stress Test - Gradually push system beyond normal capacity to find breaking points
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to normal load: 50 users over 2 minutes
    { duration: '2m', target: 100 },  // Increase to moderate load: 100 users over 2 minutes
    { duration: '2m', target: 150 },  // Push to high load: 150 users over 2 minutes
    { duration: '2m', target: 200 },  // Stress level: 200 users over 2 minutes
    { duration: '2m', target: 200 },  // Hold stress: Maintain 200 users for 2 minutes
    { duration: '2m', target: 150 },  // Gradual ramp down: 150 users
    { duration: '2m', target: 100 },  // Continue ramp down: 100 users
    { duration: '2m', target: 50 },   // Return to normal: 50 users
    { duration: '1m', target: 0 },    // Cool down: Ramp down to 0
  ],
  thresholds: {
    ...COMMON_THRESHOLDS,
    // More lenient thresholds for stress test as we're testing breaking points
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.10'], // Allow up to 10% errors at stress levels
  },
};

export default function () {
  // Stress test on multiple API endpoints - rotate through different endpoints
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
    [`${endpoint} response time < 3000ms`]: (r) => r.timings.duration < 3000,
  });
  
  sleep(1); // Think time between requests
}


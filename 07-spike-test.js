import http from 'k6/http';
import { check, sleep } from 'k6';
import { COMMON_HEADERS, getUrl, COMMON_THRESHOLDS } from './config.js';

// Spike Test - Sudden increase in load to test system's ability to handle traffic spikes
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Normal load: 10 users
    { duration: '10s', target: 100 },  // Spike: Rapid ramp-up to 100 users in 10 seconds
    { duration: '1m', target: 100 },   // Hold spike: Maintain 100 users for 1 minute
    { duration: '10s', target: 10 },   // Recovery: Rapid drop back to 10 users
    { duration: '30s', target: 10 },   // Recovery period: Monitor system recovery
  ],
  thresholds: {
    ...COMMON_THRESHOLDS,
    // More lenient thresholds for spike test as system may struggle during spike
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'], // Allow up to 5% errors during spike
  },
};

export default function () {
  // Spike test on multiple API endpoints - rotate through different endpoints
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
    [`${endpoint} response time < 2000ms`]: (r) => r.timings.duration < 2000,
  });
  
  sleep(1); // Think time between requests
}


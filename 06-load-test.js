import http from 'k6/http';
import { check, sleep } from 'k6';
import { COMMON_HEADERS, getUrl, COMMON_THRESHOLDS } from './config.js';

// Load Test - Test each API endpoint separately with dedicated scenarios
export const options = {
  scenarios: {
    // Test /status endpoint separately
    // status_endpoint: {
    //   executor: 'ramping-vus',
    //   startVUs: 0,
    //   stages: [
    //     { duration: '30s', target: 20 },  // Ramp up
    //     { duration: '4m30s', target: 20 }, // Keep 20 VU (total = 5m)
    //     { duration: '10s', target: 0 }, // Optional ramp-down
    //   ],
    //   exec: 'testStatus',
    // },
    // Test /products endpoint separately
    products_endpoint: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },  // Ramp up
        { duration: '4m30s', target: 20 }, // Keep 20 VU (total = 5m)
        { duration: '10s', target: 0 }, // Optional ramp-down
      ],
      exec: 'testProducts',
    },
    // Test /categories endpoint separately
  //   categories_endpoint: {
  //     executor: 'ramping-vus',
  //     startVUs: 0,
  //     stages: [
  //       { duration: '30s', target: 20 },  // Ramp up
  //       { duration: '4m30s', target: 20 }, // Keep 20 VU (total = 5m)
  //       { duration: '10s', target: 0 }, // Optional ramp-down
  //     ],
  //     exec: 'testCategories',
  //   },
  //   // Test /brands endpoint separately
  //   brands_endpoint: {
  //     executor: 'ramping-vus',
  //     startVUs: 0,
  //     stages: [
  //       { duration: '30s', target: 20 },  // Ramp up
  //       { duration: '4m30s', target: 20 }, // Keep 20 VU (total = 5m)
  //       { duration: '10s', target: 0 }, // Optional ramp-down
  //     ],
  //     exec: 'testBrands',
  //   },
  //   // Test /users/register endpoint separately
  //   register_endpoint: {
  //     executor: 'ramping-vus',
  //     startVUs: 0,
  //     stages: [
  //       { duration: '30s', target: 20 },  // Ramp up
  //       { duration: '4m30s', target: 20 }, // Keep 20 VU (total = 5m)
  //       { duration: '10s', target: 0 }, // Optional ramp-down
  //     ],
  //     exec: 'testRegister',
  //   },
  //   // Test /users/login endpoint separately
  //   login_endpoint: {
  //     executor: 'ramping-vus',
  //     startVUs: 0,
  //     stages: [
  //       { duration: '30s', target: 20 },  // Ramp up
  //       { duration: '4m30s', target: 20 }, // Keep 20 VU (total = 5m)
  //       { duration: '10s', target: 0 }, // Optional ramp-down
  //     ],
  //     exec: 'testLogin',
  //   },
  },
  thresholds: {
    ...COMMON_THRESHOLDS,
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};

// Helper: Parse JSON safely
function parseJSON(body) {
  try {
    return JSON.parse(body);
  } catch (e) {
    return null;
  }
}

// Helper: Generate unique email for registration
function generateEmail() {
  return `loadtest_${__VU}_${__ITER}_${Date.now()}@test.com`;
}

// Test /status endpoint
export function testStatus() {
  const response = http.get(getUrl('/status'), {
    headers: COMMON_HEADERS,
  });
  
  check(response, {
    'status returns 200': (r) => r.status === 200,
    'status response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}

// Test /products endpoint
export function testProducts() {
  const response = http.get(getUrl('/products'), {
    headers: COMMON_HEADERS,
  });
  
  check(response, {
    'products returns 200': (r) => r.status === 200,
    'products response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}

// Test /categories endpoint
export function testCategories() {
  const response = http.get(getUrl('/categories'), {
    headers: COMMON_HEADERS,
  });
  
  check(response, {
    'categories returns 200': (r) => r.status === 200,
    'categories response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  sleep(1);
}

// Test /brands endpoint
export function testBrands() {
  const response = http.get(getUrl('/brands'), {
    headers: COMMON_HEADERS,
  });
  
  check(response, {
    'brands returns 200': (r) => r.status === 200,
    'brands response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  sleep(1);
}

// Test /users/register endpoint
export function testRegister() {
  const email = generateEmail();
  const password = 'TestPassword123!';
  const registerPayload = JSON.stringify({
    email: email,
    password: password,
    first_name: 'Load',
    last_name: 'Test',
    address_1: '123 Test St',
    city: 'Test City',
    country: 'NL',
    phone_number: '+31612345678',
  });

  const registerResponse = http.post(getUrl('/users/register'), registerPayload, {
    headers: COMMON_HEADERS,
  });

  check(registerResponse, {
    'user registration succeeds or user exists': (r) => r.status === 201 || r.status === 422,
    'registration response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}

// Test /users/login endpoint
export function testLogin() {
  const loginPayload = JSON.stringify({
    email: 'customer@practicesoftwaretesting.com',
    password: 'welcome01',
  });

  const loginResponse = http.post(getUrl('/users/login'), loginPayload, {
    headers: COMMON_HEADERS,
  });

  check(loginResponse, {
    'login succeeds': (r) => r.status === 200,
    'login returns access token': (r) => {
      const body = parseJSON(r.body);
      return body && (body.access_token || body.token);
    },
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}


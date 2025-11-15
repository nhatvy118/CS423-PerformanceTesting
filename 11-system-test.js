import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { COMMON_HEADERS, getUrl, getAuthHeaders, COMMON_THRESHOLDS } from './config.js';

// Custom metrics for system testing
const systemWorkflowPassed = new Counter('system_workflow_passed');
const systemWorkflowFailed = new Counter('system_workflow_failed');
const dataConsistencyErrors = new Counter('data_consistency_errors');
const integrationErrors = new Counter('integration_errors');

// Load Test on System Testing - Run system test workflows under load
export const options = {
  stages: [
    { duration: '1m', target: 20 },    // Ramp up to 20 users over 1 minute
    { duration: '3m', target: 50 },    // Ramp up to 50 users over 3 minutes
    { duration: '5m', target: 50 },    // Stay at 50 users for 5 minutes
    { duration: '1m', target: 20 },    // Ramp down to 20 users
    { duration: '1m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    ...COMMON_THRESHOLDS,
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // More lenient for system tests
    system_workflow_passed: ['count>0'], // At least one workflow should pass
    data_consistency_errors: ['count==0'], // No data consistency errors
    integration_errors: ['count==0'], // No integration errors
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

// Helper: Generate unique email
function generateEmail() {
  return `loadtest_${__VU}_${__ITER}_${Date.now()}@test.com`;
}

// System Test Scenario 1: Complete E-commerce Purchase Flow
function testCompletePurchaseFlow() {
  // Step 1: Verify API is available
  const statusResponse = http.get(getUrl('/status'), { headers: COMMON_HEADERS });
  const statusOk = check(statusResponse, {
    'API status is healthy': (r) => r.status === 200,
    'API returns version info': (r) => {
      const body = parseJSON(r.body);
      return body && body.version && body.app_name;
    },
  });
  
  if (!statusOk) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 2: Register new user
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

  const registerOk = check(registerResponse, {
    'user registration succeeds': (r) => r.status === 201,
    'user has email in response': (r) => {
      const body = parseJSON(r.body);
      return body && body.email === email;
    },
  });

  if (!registerOk && registerResponse.status !== 422) {
    // 422 means user exists, which is acceptable for load test
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 3: Login with registered user
  const loginPayload = JSON.stringify({ email, password });
  const loginResponse = http.post(getUrl('/users/login'), loginPayload, {
    headers: COMMON_HEADERS,
  });

  const loginOk = check(loginResponse, {
    'login succeeds': (r) => r.status === 200,
    'login returns access token': (r) => {
      const body = parseJSON(r.body);
      return body && (body.access_token || body.token);
    },
  });

  if (!loginOk) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }

  const loginBody = parseJSON(loginResponse.body);
  const token = loginBody?.access_token || loginBody?.token;
  if (!token) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 4: Verify user profile
  const meResponse = http.get(getUrl('/users/me'), {
    headers: getAuthHeaders(token),
  });

  const meOk = check(meResponse, {
    'get user profile succeeds': (r) => r.status === 200,
    'user profile has correct email': (r) => {
      const body = parseJSON(r.body);
      return body && body.email === email;
    },
    'user profile has required fields': (r) => {
      const body = parseJSON(r.body);
      return body && body.id && body.email && body.first_name;
    },
  });

  if (!meOk) {
    dataConsistencyErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 5: Browse products
  const productsResponse = http.get(getUrl('/products'), {
    headers: COMMON_HEADERS,
  });

  const productsOk = check(productsResponse, {
    'products list retrieves successfully': (r) => r.status === 200,
    'products list has data': (r) => {
      const body = parseJSON(r.body);
      return body && body.data && Array.isArray(body.data) && body.data.length > 0;
    },
  });

  if (!productsOk) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }

  const productsBody = parseJSON(productsResponse.body);
  const firstProduct = productsBody.data[0];
  if (!firstProduct || !firstProduct.id) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 6: Get product details
  const productDetailResponse = http.get(getUrl(`/products/${firstProduct.id}`), {
    headers: COMMON_HEADERS,
  });

  const productDetailOk = check(productDetailResponse, {
    'product details retrieves successfully': (r) => r.status === 200,
    'product details match product from list': (r) => {
      const body = parseJSON(r.body);
      return body && body.id === firstProduct.id;
    },
    'product has required fields': (r) => {
      const body = parseJSON(r.body);
      return body && body.id && body.name && body.price !== undefined;
    },
  });

  if (!productDetailOk) {
    dataConsistencyErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 7: Create cart
  const createCartResponse = http.post(getUrl('/carts'), JSON.stringify({}), {
    headers: getAuthHeaders(token),
  });

  const createCartOk = check(createCartResponse, {
    'cart creation succeeds': (r) => r.status === 201,
    'cart creation returns cart id': (r) => {
      const body = parseJSON(r.body);
      return body && body.id;
    },
  });

  if (!createCartOk) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }

  const cartBody = parseJSON(createCartResponse.body);
  const cartId = cartBody.id;
  if (!cartId) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 8: Add product to cart
  const addToCartPayload = JSON.stringify({
    product_id: firstProduct.id,
    quantity: 2,
  });

  const addToCartResponse = http.post(getUrl(`/carts/${cartId}`), addToCartPayload, {
    headers: getAuthHeaders(token),
  });

  const addToCartOk = check(addToCartResponse, {
    'add to cart succeeds': (r) => r.status === 200 || r.status === 201,
  });

  if (!addToCartOk) {
    integrationErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 9: Verify cart contents
  const getCartResponse = http.get(getUrl(`/carts/${cartId}`), {
    headers: getAuthHeaders(token),
  });

  const getCartOk = check(getCartResponse, {
    'get cart succeeds': (r) => r.status === 200,
    'cart contains added product': (r) => {
      const body = parseJSON(r.body);
      if (!body || !body.items) return false;
      const items = Array.isArray(body.items) ? body.items : [];
      return items.some(item => item.product_id === firstProduct.id || item.id === firstProduct.id);
    },
    'cart has correct quantity': (r) => {
      const body = parseJSON(r.body);
      if (!body || !body.items) return false;
      const items = Array.isArray(body.items) ? body.items : [];
      const item = items.find(i => i.product_id === firstProduct.id || i.id === firstProduct.id);
      return item && item.quantity >= 2;
    },
  });

  if (!getCartOk) {
    dataConsistencyErrors.add(1);
    systemWorkflowFailed.add(1);
    return false;
  }
  sleep(1);

  // Step 10: Add product to favorites
  const addFavoritePayload = JSON.stringify({
    product_id: firstProduct.id,
  });

  const addFavoriteResponse = http.post(getUrl('/favorites'), addFavoritePayload, {
    headers: getAuthHeaders(token),
  });

  const addFavoriteOk = check(addFavoriteResponse, {
    'add to favorites succeeds': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);

  // Step 11: Verify favorites list
  const favoritesResponse = http.get(getUrl('/favorites'), {
    headers: getAuthHeaders(token),
  });

  const favoritesOk = check(favoritesResponse, {
    'get favorites succeeds': (r) => r.status === 200,
    'favorites list is array': (r) => {
      const body = parseJSON(r.body);
      return body && Array.isArray(body);
    },
  });
  sleep(1);

  // All steps passed
  systemWorkflowPassed.add(1);
  return true;
}

// System Test Scenario 2: Data Consistency Test
function testDataConsistency() {
  // Get products list
  const productsResponse = http.get(getUrl('/products'), {
    headers: COMMON_HEADERS,
  });

  const productsBody = parseJSON(productsResponse.body);
  if (!productsBody || !productsBody.data || productsBody.data.length === 0) {
    return false;
  }

  const product = productsBody.data[0];
  const productId = product.id;

  // Verify product details match between list and detail endpoint
  const productDetailResponse = http.get(getUrl(`/products/${productId}`), {
    headers: COMMON_HEADERS,
  });

  const productDetailBody = parseJSON(productDetailResponse.body);

  const consistencyOk = check(null, {
    'product name is consistent': () => {
      if (!productDetailBody || !productDetailBody.name) return false;
      return product.name === productDetailBody.name || product.name === productDetailBody.id;
    },
    'product id is consistent': () => product.id === productDetailBody.id,
  });

  if (!consistencyOk) {
    dataConsistencyErrors.add(1);
    return false;
  }

  // Test related products consistency
  const relatedResponse = http.get(getUrl(`/products/${productId}/related`), {
    headers: COMMON_HEADERS,
  });

  const relatedOk = check(relatedResponse, {
    'related products endpoint works': (r) => r.status === 200,
    'related products returns array': (r) => {
      const body = parseJSON(r.body);
      return body && Array.isArray(body);
    },
  });

  return relatedOk;
}

// Main test function - runs system test workflows under load
export default function () {
  // Run complete purchase flow test
  const purchaseFlowResult = testCompletePurchaseFlow();
  sleep(1);

  // Run data consistency test
  const consistencyResult = testDataConsistency();
  sleep(1);

  // Overall system health check
  if (purchaseFlowResult && consistencyResult) {
    // Workflow passed
  } else {
    systemWorkflowFailed.add(1);
  }
}


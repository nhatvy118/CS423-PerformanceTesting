# k6 Performance Testing Suite for Sprint5 API

This folder contains comprehensive k6 performance tests for the Sprint5 API endpoints.

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Windows (using Chocolatey)
choco install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Verify Installation

```bash
k6 version
```

## Configuration

Edit `config.js` to configure:
- **BASE_URL**: API base URL (default: `http://localhost:8091/api`)
- **TEST_USER**: Test user credentials for authenticated endpoints
- **Thresholds**: Performance thresholds for all tests

### Environment Variables

You can override configuration using environment variables:

```bash
# Set custom base URL
BASE_URL=http://localhost:8091/api k6 run 01-basic-api-test.js

# Set custom test user
TEST_EMAIL=user@example.com TEST_PASSWORD=password123 k6 run 02-authentication-test.js
```

## Test Scripts

### 1. `01-basic-api-test.js` - Basic API Endpoints
**Purpose**: Test core API endpoints (status, products, categories, brands)  
**Load Pattern**: Ramp up to 50 concurrent users  
**Duration**: ~4 minutes

```bash
k6 run 01-basic-api-test.js
```

**Tests**:
- API status endpoint
- Products listing
- Categories listing
- Brands listing
- Product search

---

### 2. `02-authentication-test.js` - Authentication Flow
**Purpose**: Test user registration, login, and profile endpoints  
**Load Pattern**: Ramp up to 20 concurrent users  
**Duration**: ~4 minutes

```bash
k6 run 02-authentication-test.js
```

**Tests**:
- User registration
- User login
- Get user profile
- Refresh token

**Note**: Requires valid test user credentials in `config.js`

---

### 3. `03-products-test.js` - Products Endpoint Deep Dive
**Purpose**: Comprehensive testing of product-related endpoints  
**Load Pattern**: Ramp up to 60 concurrent users  
**Duration**: ~4 minutes

```bash
k6 run 03-products-test.js
```

**Tests**:
- Get all products
- Get single product
- Get related products
- Search products

**Custom Metrics**:
- `product_response_time`: Response time trend
- `product_errors`: Error rate

---

### 4. `04-shopping-cart-test.js` - Shopping Cart Operations
**Purpose**: Test shopping cart CRUD operations  
**Load Pattern**: Ramp up to 20 concurrent users  
**Duration**: ~4 minutes

```bash
k6 run 04-shopping-cart-test.js
```

**Tests**:
- User login
- Add item to cart
- Get cart
- Update item quantity
- Remove item from cart (optional)

**Note**: Requires authentication

---

### 5. `05-full-journey-test.js` - Complete User Journey
**Purpose**: Simulate a complete user shopping journey  
**Load Pattern**: Ramp up to 40 concurrent users  
**Duration**: ~5 minutes

```bash
k6 run 05-full-journey-test.js
```

**Journey Steps**:
1. Check API status
2. Browse products
3. View categories
4. View brands
5. Search products
6. View product details
7. User login
8. View user profile
9. View favorites

---

### 6. `06-load-test.js` - Load Testing
**Purpose**: Test system under normal expected load  
**Load Pattern**: Gradual ramp-up to 100 users, sustained load  
**Duration**: ~11 minutes

```bash
k6 run 06-load-test.js
```

**Load Pattern**:
- 1m: Ramp to 50 users
- 3m: Ramp to 100 users
- 5m: Stay at 100 users
- 2m: Ramp down

---

### 7. `07-stress-test.js` - Stress Testing
**Purpose**: Find system breaking point by gradually increasing load  
**Load Pattern**: Gradual increase from 10 to 300 users  
**Duration**: ~9 minutes

```bash
k6 run 07-stress-test.js
```

**Load Pattern**:
- Gradually increases from 10 → 50 → 100 → 150 → 200 → 250 → 300 users
- Sustains at 300 users for 2 minutes

**Note**: More lenient thresholds to identify breaking points

---

### 8. `08-spike-test.js` - Spike Testing
**Purpose**: Test system response to sudden traffic spikes  
**Load Pattern**: Sudden spikes from 10 to 100/150 users  
**Duration**: ~4 minutes

```bash
k6 run 08-spike-test.js
```

**Load Pattern**:
- Normal: 10 users
- Spike 1: Sudden jump to 100 users
- Normal: Back to 10 users
- Spike 2: Sudden jump to 150 users

**Note**: Tests system resilience to flash sales or viral traffic

---

### 9. `09-endurance-test.js` - Endurance Testing
**Purpose**: Test system stability over extended period (memory leaks, resource leaks)  
**Load Pattern**: 20 users for 10 minutes  
**Duration**: ~12 minutes

```bash
k6 run 09-endurance-test.js
```

**Load Pattern**:
- 1m: Ramp to 20 users
- 10m: Stay at 20 users
- 1m: Ramp down

**Use Case**: Identify memory leaks, database connection leaks, etc.

---

### 10. `10-reports-test.js` - Reports Endpoint Testing
**Purpose**: Test report generation endpoints (resource-intensive)  
**Load Pattern**: 10 concurrent users  
**Duration**: ~4 minutes

```bash
k6 run 10-reports-test.js
```

**Tests**:
- Total sales of years
- Total sales per country
- Top 10 purchased products
- Top 10 best-selling categories
- Customers by country
- Average sales per month
- Average sales per week

**Note**: 
- Requires authentication
- May have rate limiting
- More lenient thresholds due to resource-intensive nature

---

### 11. `11-system-test.js` - Comprehensive System Testing
**Purpose**: Complete end-to-end system testing with workflows, data validation, and integration testing  
**Load Pattern**: 10 concurrent users  
**Duration**: ~4 minutes

```bash
k6 run 11-system-test.js
```

**Tests**:
- Complete e-commerce purchase flow (registration → login → browse → cart → favorites)
- Data consistency across endpoints
- Integration between services
- Error handling scenarios
- Cross-endpoint dependencies

**Custom Metrics**:
- `system_workflow_passed`: Number of successful workflows
- `system_workflow_failed`: Number of failed workflows
- `data_consistency_errors`: Data inconsistency issues
- `integration_errors`: Integration issues between endpoints

**Use Case**: Verify complete system functionality and integration

---

### 12. `12-system-test-simple.js` - Simple System Test
**Purpose**: Basic system testing demonstration with single-user workflow  
**Load Pattern**: 1 virtual user, 1 iteration  
**Duration**: ~30 seconds

```bash
k6 run 12-system-test-simple.js
```

**Tests**:
- API health check
- Product browsing workflow
- Product details retrieval
- Error handling
- Integration testing (categories, search)

**Use Case**: Quick system verification, CI/CD integration

---

## k6 for System Testing

### Can k6 be used for System Testing?

**Yes!** k6 is excellent for API-level system testing. Here's what it can do:

#### ✅ What k6 CAN do for System Testing:

1. **End-to-End Workflows**: Test complete user journeys across multiple endpoints
2. **Integration Testing**: Verify services work together correctly
3. **Data Validation**: Check response data structure, types, and values
4. **Data Consistency**: Verify data consistency across related endpoints
5. **Error Scenarios**: Test error handling and edge cases
6. **API Contract Testing**: Validate API responses match expected schemas
7. **Workflow Orchestration**: Chain multiple API calls in realistic scenarios
8. **Business Logic Testing**: Test complete business workflows via APIs

#### ❌ What k6 CANNOT do:

1. **UI Testing**: No browser automation (use Playwright, Selenium, Cypress)
2. **Visual Testing**: No screenshot comparison or visual regression
3. **JavaScript Execution**: Cannot test client-side JavaScript
4. **File System Operations**: Limited file system testing capabilities

### System Testing Best Practices with k6

1. **Use Checks Extensively**: Validate not just status codes, but response data
2. **Test Data Consistency**: Verify data from one endpoint matches related endpoints
3. **Test Error Scenarios**: Include negative test cases
4. **Chain Requests**: Use responses from one request in subsequent requests
5. **Use Custom Metrics**: Track system-specific metrics (workflows passed/failed)
6. **Test Integration Points**: Verify different services/components work together
7. **Validate Business Rules**: Test complete business workflows, not just endpoints

### Example System Test Patterns

```javascript
// Pattern 1: Complete Workflow
export default function() {
  // Step 1: Register user
  const registerResponse = http.post('/users/register', ...);
  const userId = JSON.parse(registerResponse.body).id;
  
  // Step 2: Login
  const loginResponse = http.post('/users/login', ...);
  const token = JSON.parse(loginResponse.body).access_token;
  
  // Step 3: Use authenticated endpoint
  const profileResponse = http.get('/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Step 4: Verify data consistency
  check(profileResponse, {
    'user id matches': (r) => {
      const body = JSON.parse(r.body);
      return body.id === userId;
    }
  });
}

// Pattern 2: Data Consistency Testing
export default function() {
  // Get list
  const listResponse = http.get('/products');
  const productId = JSON.parse(listResponse.body).data[0].id;
  
  // Get detail
  const detailResponse = http.get(`/products/${productId}`);
  
  // Verify consistency
  check(detailResponse, {
    'product matches list': (r) => {
      const listBody = JSON.parse(listResponse.body);
      const detailBody = JSON.parse(r.body);
      return listBody.data[0].name === detailBody.name;
    }
  });
}

// Pattern 3: Integration Testing
export default function() {
  // Create cart
  const cartResponse = http.post('/carts', ...);
  const cartId = JSON.parse(cartResponse.body).id;
  
  // Add product
  http.post(`/carts/${cartId}`, { product_id: '123', quantity: 1 });
  
  // Verify cart
  const getCartResponse = http.get(`/carts/${cartId}`);
  check(getCartResponse, {
    'cart contains product': (r) => {
      const body = JSON.parse(r.body);
      return body.items.some(item => item.product_id === '123');
    }
  });
}
```

---

## Understanding k6 Output

### Key Metrics

- **http_reqs**: Total number of HTTP requests
- **http_reqs/s**: Throughput (requests per second)
- **http_req_duration**: Response time statistics
  - `avg`: Average response time
  - `min`: Minimum response time
  - `max`: Maximum response time
  - `p(95)`: 95th percentile (95% of requests are faster)
  - `p(99)`: 99th percentile (99% of requests are faster)
- **http_req_failed**: Error rate (percentage of failed requests)
- **vus**: Virtual users (concurrent users)
- **checks**: Custom check results (pass/fail rate)

### Example Output Interpretation

```
✓ products endpoint returns 200
✓ products response time < 500ms

checks.........................: 100.00% ✓ 3000  ✗ 0
http_req_duration..............: avg=145ms min=50ms med=130ms max=800ms p(95)=198ms p(99)=356ms
http_req_failed................: 0.00%  ✓ 0     ✗ 1000
http_reqs......................: 1000   16.67/s
vus............................: 50     min=0    max=50
```

**Analysis**:
- ✅ All checks passed (100%)
- ✅ P95 response time (198ms) meets threshold (< 500ms)
- ✅ Zero errors
- ✅ Stable throughput (16.67 req/s)
- ✅ Consistent virtual users (50)

## Customizing Tests

### Adjust Load Pattern

Edit the `stages` array in `options`:

```javascript
stages: [
  { duration: '30s', target: 20 },  // Ramp up to 20 users in 30s
  { duration: '1m', target: 50 },    // Ramp up to 50 users in 1m
  { duration: '2m', target: 50 },   // Stay at 50 users for 2m
  { duration: '30s', target: 0 },   // Ramp down to 0 in 30s
],
```

### Adjust Thresholds

Edit the `thresholds` object:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],  // 95% should be < 500ms
  http_req_failed: ['rate<0.01'],    // Error rate < 1%
  checks: ['rate>0.95'],             // 95% of checks should pass
},
```

### Change Target URL

Update `config.js` or use environment variable:

```bash
BASE_URL=http://localhost:8091/api k6 run 01-basic-api-test.js
```

## Generating Reports

Use k6's built-in report generation via command line options.

### Report Formats

k6 supports multiple output formats for reports:

1. **HTML Report** - Visual, interactive report with charts and metrics
2. **JSON Report** - Machine-readable report for automation
3. **Cloud Output** - Send results to k6 Cloud
4. **InfluxDB** - Send results to InfluxDB for time-series analysis
5. **StatsD** - Send metrics to StatsD-compatible services

For more output options, see [k6 Results Output](https://k6.io/docs/results-visualization/).

### Running Tests and Generating Reports

Use k6's built-in report generation via command line:

```bash
# Run test with HTML report output
k6 run --out html=report.html 12-system-test-simple.js

# Run test with JSON report output
k6 run --out json=report.json 12-system-test-simple.js

# Run test with multiple output formats
k6 run --out html=report.html --out json=report.json 12-system-test-simple.js
```

### Viewing Reports

```bash
# Open HTML report in browser
open report.html

# Or on Linux
xdg-open report.html

# View JSON report
cat report.json
```

### Report Contents

The HTML report includes:
- **Summary Cards**: Key metrics at a glance (HTTP requests, response time, error rate, checks)
- **Metrics Table**: Detailed metrics with statistics
- **Checks Table**: Test assertion results
- **HTTP Statistics**: Request/response statistics

---

## Running Multiple Tests

### Run All Tests Sequentially

```bash
# Run all tests sequentially
for test in *.js; do
  if [[ "$test" != "config.js" ]]; then
    echo "Running $test..."
    k6 run "$test"
    echo "---"
  fi
done
```

### Run Specific Test Categories

```bash
# Run only basic tests
k6 run 01-basic-api-test.js
k6 run 03-products-test.js

# Run only load/stress tests
k6 run 06-load-test.js
k6 run 07-stress-test.js
k6 run 08-spike-test.js
```

## Best Practices

1. **Start Small**: Begin with basic tests before running stress tests
2. **Monitor Resources**: Watch server CPU, memory, and database connections during tests
3. **Test Locally First**: Test against local environment before production
4. **Set Realistic Thresholds**: Adjust thresholds based on your SLA requirements
5. **Review Logs**: Check API logs for errors and warnings
6. **Gradual Increase**: Don't jump directly to high load; use gradual ramp-up

## Troubleshooting

### Connection Errors

- Check if API server is running
- Verify BASE_URL in `config.js`
- Check firewall/network settings
- Ensure Docker containers are up (if using local setup)

### High Error Rates

- Verify target server is healthy
- Check rate limiting on target server
- Reduce load if testing production
- Review API logs for errors

### Slow Response Times

- Normal for remote servers (network latency)
- Use local environment for faster results
- Check database query performance
- Review server resource usage (CPU, memory)

### Authentication Failures

- Verify test user credentials in `config.js`
- Check if test user exists in database
- Ensure JWT token is being extracted correctly
- Review authentication middleware logs

## API Endpoints Tested

### Public Endpoints
- `GET /status` - API status
- `GET /products` - List products
- `GET /products/{id}` - Get product details
- `GET /products/search` - Search products
- `GET /products/{id}/related` - Get related products
- `GET /categories` - List categories
- `GET /categories/tree` - Get category tree
- `GET /brands` - List brands

### Authenticated Endpoints
- `POST /users/register` - Register user
- `POST /users/login` - Login
- `GET /users/me` - Get user profile
- `GET /users/refresh` - Refresh token
- `GET /favorites` - Get user favorites
- `POST /carts/{id}` - Add to cart
- `GET /carts/{id}` - Get cart
- `PUT /carts/{id}/product/quantity` - Update quantity
- `GET /reports/*` - Various reports

## File Structure

- **`.gitignore`** - Ignores the `reports/` directory in git

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Metrics Reference](https://k6.io/docs/using-k6/metrics/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [k6 Scenarios](https://k6.io/docs/using-k6/scenarios/)
- [k6 Results Output](https://k6.io/docs/results-visualization/)

## Notes

- All tests use the `/api` prefix by default
- Authentication tests require valid test user credentials
- Report tests may be rate-limited
- Some tests may fail if test data is not available (e.g., no products in database)
- Adjust thresholds based on your performance requirements


# k6 Performance Testing Suite for Sprint5 API

This folder contains comprehensive k6 performance tests for the Sprint5 API endpoints.

## Quick Start

### Step 1: Install k6

Choose the installation method for your operating system:

**macOS:**
```bash
brew install k6
```

**Windows (using Chocolatey):**
```bash
choco install k6
```

**Linux (Ubuntu/Debian):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Verify Installation:**
```bash
k6 version
```

You should see output like: `k6 v0.x.x (date)`

### Step 2: Configure Test Settings

Edit `config.js` to set your API base URL and test credentials:

```javascript
// Default: http://localhost:8091
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8091';

// Test user credentials
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'customer@practicesoftwaretesting.com',
  password: __ENV.TEST_PASSWORD || 'welcome01',
};
```

**Or use environment variables:**
```bash
# Set custom base URL
BASE_URL=https://api.example.com k6 run 06-load-test.js

# Set custom test user
TEST_EMAIL=user@example.com TEST_PASSWORD=password123 k6 run 11-system-test.js
```

### Step 3: Run Your First Test

**Option 1: Using k6 directly**
```bash
# Run load test
k6 run 06-load-test.js

# Run system test
k6 run 11-system-test.js
```

**Option 2: Using Makefile (Recommended - includes HTML reports)**
```bash
# Run load test with HTML report
make load-test

# Run spike test with HTML report
make spike-test

# Run stress test with HTML report
make stress-test

# Run system test with HTML report
make system-test

# Run all tests
make all

# View available commands
make help
```

After running tests with Makefile, open the generated HTML report in your browser:
```bash
# macOS
open load-test-report.html

# Linux
xdg-open load-test-report.html
```

---

## Test Scripts

This project contains the following test scripts:

### 1. `06-load-test.js` - Load Testing
**Purpose**: Test system under normal expected load  
**Load Pattern**: Multiple scenarios testing different endpoints separately  
**Duration**: ~5 minutes per scenario

```bash
# Direct k6 command
k6 run 06-load-test.js

# Using Makefile (with HTML report)
make load-test
```

**Tests**:
- API status endpoint
- Products endpoint
- Categories endpoint
- Brands endpoint
- Product search
- Product details
- Related products

**Load Pattern**:
- Each endpoint tested separately with 20 concurrent users
- 30s ramp-up, 4m30s sustained load, 10s ramp-down

---

### 2. `07-spike-test.js` - Spike Testing
**Purpose**: Test system response to sudden traffic spikes  
**Load Pattern**: Sudden spikes from 10 to 100/150 users  
**Duration**: ~4 minutes

```bash
# Direct k6 command
k6 run 07-spike-test.js

# Using Makefile (with HTML report)
make spike-test
```

**Load Pattern**:
- Normal: 10 users
- Spike 1: Sudden jump to 100 users
- Normal: Back to 10 users
- Spike 2: Sudden jump to 150 users

**Note**: Tests system resilience to flash sales or viral traffic

---

### 3. `08-stress-test.js` - Stress Testing
**Purpose**: Find system breaking point by gradually increasing load  
**Load Pattern**: Gradual increase from 10 to 300 users  
**Duration**: ~9 minutes

```bash
# Direct k6 command
k6 run 08-stress-test.js

# Using Makefile (with HTML report)
make stress-test
```

**Load Pattern**:
- Gradually increases from 10 → 50 → 100 → 150 → 200 → 250 → 300 users
- Sustains at 300 users for 2 minutes

**Note**: More lenient thresholds to identify breaking points

---

### 4. `11-system-test.js` - Comprehensive System Testing
**Purpose**: Complete end-to-end system testing with workflows, data validation, and integration testing  
**Load Pattern**: 10 concurrent users  
**Duration**: ~4 minutes

```bash
# Direct k6 command
k6 run 11-system-test.js

# Using Makefile (with HTML report)
make system-test
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

## Configuration

### Base URL Configuration

The default base URL is `http://localhost:8091`. You can change it in two ways:

**Method 1: Edit `config.js`**
```javascript
export const BASE_URL = __ENV.BASE_URL || 'http://your-api-url.com';
```

**Method 2: Use environment variable**
```bash
BASE_URL=https://api.example.com k6 run 06-load-test.js
```

### Test User Credentials

Default test user credentials are set in `config.js`:
- Email: `customer@practicesoftwaretesting.com`
- Password: `welcome01`

**Override with environment variables:**
```bash
TEST_EMAIL=user@example.com TEST_PASSWORD=password123 k6 run 11-system-test.js
```

### Performance Thresholds

Default thresholds are defined in `config.js`:
- `http_req_duration`: p(95) < 500ms, p(99) < 1000ms
- `http_req_failed`: rate < 0.01 (less than 1% errors)
- `checks`: rate > 0.95 (95% of checks should pass)

You can modify these in `config.js` or override them in individual test files.

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

---

## Generating Reports

### Using Makefile (Recommended)

The Makefile automatically generates HTML reports:

```bash
# Run test and generate HTML report
make load-test

# Open the report
open load-test-report.html
```

### Using k6 Directly

**HTML Report:**
```bash
# For system test (requires k6-to-html)
k6 run --summary-export=summary.json 11-system-test.js
npx --yes k6-to-html summary.json -o report.html
```

**JSON Report:**
```bash
k6 run --summary-export=summary.json 06-load-test.js
```

**View JSON report:**
```bash
cat summary.json
```

### Report Contents

The HTML report includes:
- **Summary Cards**: Key metrics at a glance (HTTP requests, response time, error rate, checks)
- **Metrics Table**: Detailed metrics with statistics
- **Checks Table**: Test assertion results
- **HTTP Statistics**: Request/response statistics

---

## Running Multiple Tests

### Using Makefile

```bash
# Run all tests sequentially with HTML reports
make all
```

### Using k6 Directly

```bash
# Run all tests sequentially
for test in 06-load-test.js 07-spike-test.js 08-stress-test.js 11-system-test.js; do
  echo "Running $test..."
  k6 run "$test"
  echo "---"
done
```

### Run Specific Tests

```bash
# Run only load/stress tests
k6 run 06-load-test.js
k6 run 08-stress-test.js

# Run system test
k6 run 11-system-test.js
```

---

## Customizing Tests

### Adjust Load Pattern

Edit the `stages` array in test file's `options`:

```javascript
stages: [
  { duration: '30s', target: 20 },  // Ramp up to 20 users in 30s
  { duration: '1m', target: 50 },    // Ramp up to 50 users in 1m
  { duration: '2m', target: 50 },   // Stay at 50 users for 2m
  { duration: '30s', target: 0 },   // Ramp down to 0 in 30s
],
```

### Adjust Thresholds

Edit the `thresholds` object in test file or use `COMMON_THRESHOLDS` from `config.js`:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],  // 95% should be < 500ms
  http_req_failed: ['rate<0.01'],    // Error rate < 1%
  checks: ['rate>0.95'],             // 95% of checks should pass
},
```

### Change Target URL

**Method 1: Update `config.js`**
```javascript
export const BASE_URL = 'https://api.example.com';
```

**Method 2: Use environment variable**
```bash
BASE_URL=https://api.example.com k6 run 06-load-test.js
```

**Method 3: Use Makefile**
```bash
BASE_URL=https://api.example.com make load-test
```

---

## Best Practices

1. **Start Small**: Begin with system test before running stress tests
2. **Monitor Resources**: Watch server CPU, memory, and database connections during tests
3. **Test Locally First**: Test against local environment before production
4. **Set Realistic Thresholds**: Adjust thresholds based on your SLA requirements
5. **Review Logs**: Check API logs for errors and warnings
6. **Gradual Increase**: Don't jump directly to high load; use gradual ramp-up
7. **Use HTML Reports**: Generate and review HTML reports for detailed analysis

---

## Troubleshooting

### Connection Errors

- Check if API server is running
- Verify BASE_URL in `config.js` or environment variable
- Check firewall/network settings
- Ensure Docker containers are up (if using local setup)
- Test connectivity: `curl http://localhost:8091/status`

### High Error Rates

- Verify target server is healthy
- Check rate limiting on target server
- Reduce load if testing production
- Review API logs for errors
- Check if test user credentials are correct

### Slow Response Times

- Normal for remote servers (network latency)
- Use local environment for faster results
- Check database query performance
- Review server resource usage (CPU, memory)
- Consider network latency if testing remote servers

### Authentication Failures

- Verify test user credentials in `config.js`
- Check if test user exists in database
- Ensure JWT token is being extracted correctly
- Review authentication middleware logs
- Test login manually: `curl -X POST http://localhost:8091/users/login -d '{"email":"...","password":"..."}'`

### k6 Installation Issues

**macOS:**
```bash
# If brew install fails, try:
brew update
brew install k6
```

**Linux:**
```bash
# If GPG key import fails, try alternative:
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/
```

**Windows:**
```bash
# Alternative: Download from https://github.com/grafana/k6/releases
# Extract and add to PATH
```

---

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

---

## File Structure

```
.
├── config.js                 # Shared configuration for all tests
├── 06-load-test.js          # Load testing script
├── 07-spike-test.js         # Spike testing script
├── 08-stress-test.js        # Stress testing script
├── 11-system-test.js        # System testing script
├── Makefile                 # Convenience commands for running tests
├── README.md                # This file
└── *.html, *.json          # Generated test reports (gitignored)
```

---

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Metrics Reference](https://k6.io/docs/using-k6/metrics/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [k6 Scenarios](https://k6.io/docs/using-k6/scenarios/)
- [k6 Results Output](https://k6.io/docs/results-visualization/)

---

## Notes

- Default base URL is `http://localhost:8091` (no `/api` prefix)
- Authentication tests require valid test user credentials
- Some tests may fail if test data is not available (e.g., no products in database)
- Adjust thresholds based on your performance requirements
- HTML reports are generated automatically when using Makefile
- Test reports (`.html`, `.json`) are gitignored

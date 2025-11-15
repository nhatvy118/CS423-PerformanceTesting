# Simple Makefile for k6 Load Testing with HTML Reports

BASE_URL ?= https://api.practicesoftwaretesting.com

.PHONY: help load-test spike-test stress-test system-test all clean

help:
	@echo "k6 Load Testing"
	@echo ""
	@echo "Usage:"
	@echo "  make load-test    - Run load test with HTML report"
	@echo "  make spike-test   - Run spike test with HTML report"
	@echo "  make stress-test  - Run stress test with HTML report"
	@echo "  make system-test  - Run system test with HTML report"
	@echo "  make all          - Run all tests with HTML reports"
	@echo "  make clean        - Remove generated report files"
	@echo ""
	@echo "Override BASE_URL: BASE_URL=https://api.example.com/api make load-test"

load-test:
	@echo "Running load test & generating HTML report..."
	@K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=load-test-report.html \
		BASE_URL=$(BASE_URL) \
		k6 run --summary-export=load-test-summary.json 06-load-test.js
	@echo "Done. Open load-test-report.html in your browser."

spike-test:
	@echo "Running spike test & generating HTML report..."
	@K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=spike-test-report.html \
		BASE_URL=$(BASE_URL) \
		k6 run --summary-export=spike-test-summary.json 07-spike-test.js
	@echo "Done. Open spike-test-report.html in your browser."

stress-test:
	@echo "Running stress test & generating HTML report..."
	@K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=stress-test-report.html \
		BASE_URL=$(BASE_URL) \
		k6 run --summary-export=stress-test-summary.json 08-stress-test.js
	@echo "Done. Open stress-test-report.html in your browser."

open-load-test-report:
	@open load-test-report.html

open-spike-test-report:
	@open spike-test-report.html

open-stress-test-report:
	@open stress-test-report.html

open-system-test-report:
	@open system-test.html

system-test:
	@echo "Running system test..."
	@BASE_URL=$(BASE_URL) k6 run --summary-export=system-test-summary.json 11-system-test.js
	@echo "Generating HTML report..."
	@npx --yes k6-to-html system-test-summary.json -o system-test.html
	@echo "HTML report generated: system-test.html"

all: load-test spike-test stress-test system-test
	@echo "All tests completed! Check HTML reports."

clean:
	@echo "Cleaning generated files..."
	@rm -f load-test-summary.json load-test-report.html \
		spike-test-summary.json spike-test-report.html \
		stress-test-summary.json stress-test-report.html \
		system-test-summary.json system-test.html
	@echo "Cleaned!"

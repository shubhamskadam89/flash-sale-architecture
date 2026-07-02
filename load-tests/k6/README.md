# Flash Sale Engine - k6 Load & Rate Limiting Benchmark Suite

This directory contains the k6 load testing and rate limiting benchmark suite. It provides automated benchmarking tools designed to test concurrency, latency, rate-limiting, and idempotency of the Flash Sale Engine.

## Directory Structure

```text
load-tests/k6/
├── config.js                 # Configuration environment fallback mappings
├── helpers.js                # Shared utility functions (login, discovery, headers, purchase)
├── flash-sale-load.js        # High-concurrency flash sale load test script
├── rate-limit-breach.js      # Rate limiter benchmark script
├── run-benchmark.sh          # Orchestrates benchmarks and generates HTML reports
├── reports/                  # Historic test runs organized by date (HTML format)
└── results/                  # Raw json output files from k6 (Git ignored)
```

---

## Prerequisites

Before running the benchmarks, ensure you have the following prerequisites installed and configured:

### 1. Install k6
Install Grafana k6 on your system:
* **macOS (via Homebrew):**
  ```bash
  brew install k6
  ```
* **Linux (Debian/Ubuntu):**
  ```bash
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD194E8CEE2280B40DCA75EC5B7825E248B87D
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```

### 2. Node & k6-reporter
Install the HTML report generator to process the raw json results into pretty charts:
```bash
npm install -g k6-reporter
```

### 3. Start Backend & Infrastructure
Make sure the database and Redis services are running (via Docker Compose):
```bash
# From project root
docker-compose -f docker/docker-compose.yml up -d
```
Then start the backend application (e.g. via IntelliJ or Maven command line):
```bash
mvn spring-boot:run
```

---

## Benchmarks

### 1. Flash Sale Load Test (`flash-sale-load.js`)
Simulates a high-concurrency event by logging in, discovering the active flash sale with the highest remaining inventory, and executing parallel purchase requests.
* **Run command:**
  ```bash
  k6 run flash-sale-load.js
  ```
* **Custom Parameters (via Env Vars):**
  * `VUS`: Number of concurrent virtual users (Default: `500`)
  * `DURATION`: Test duration (Default: `"30s"`)
  * `EMAIL`/`PASSWORD`: Credentials of the load test user account

---

### 2. Rate Limiter Benchmark (`rate-limit-breach.js`)
Stresses the request rate limiter to analyze throughput limits and evaluate algorithm performance under high pressure.

It automatically supports checking:
* **Fixed Window**
* **Sliding Window**
* **Token Bucket**

#### Step-by-Step Benchmarking Instructions:
The benchmark should be run three times, modifying the configuration in `application.yaml` before each run.

1. **Step 1: Benchmark FIXED_WINDOW**
   * Change `ratelimit.algorithm: FIXED_WINDOW` in `src/main/resources/application.yaml`.
   * Restart the backend server.
   * Run the benchmark orchestrator:
     ```bash
     ./run-benchmark.sh fixed-window
     ```

2. **Step 2: Benchmark SLIDING_WINDOW**
   * Change `ratelimit.algorithm: SLIDING_WINDOW` in `src/main/resources/application.yaml`.
   * Restart the backend server.
   * Run the benchmark orchestrator:
     ```bash
     ./run-benchmark.sh sliding-window
     ```

3. **Step 3: Benchmark TOKEN_BUCKET**
   * Change `ratelimit.algorithm: TOKEN_BUCKET` in `src/main/resources/application.yaml`.
   * Restart the backend server.
   * Run the benchmark orchestrator:
     ```bash
     ./run-benchmark.sh token-bucket
     ```

---

## HTML Reports & Raw Results

HTML reports are generated inside a timestamped folder to preserve historical test runs:
```text
reports/
└── YYYY-MM-DD/
    ├── fixed-window.html
    ├── sliding-window.html
    └── token-bucket.html
```

* **Allowed Requests:** Count of successful `200 OK` responses allowed past the rate-limiter.
* **Blocked Requests:** Count of rate-limited `429 Too Many Requests` responses.
* **Unexpected:** Responses not matching `200` or `429` (indicating application logic errors).
* **Average Latency / P95 Latency:** Time taken per request in milliseconds.

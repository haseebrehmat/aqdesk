import { performance } from 'node:perf_hooks'

const baseUrl = process.env.LOAD_TEST_BASE_URL || 'http://127.0.0.1:8080/api'
const requestCount = Number(process.env.LOAD_TEST_REQUESTS || 100)
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY || 10)
const thresholdMs = Number(process.env.LOAD_TEST_THRESHOLD_MS || 500)
const endpoints = ['/questions', '/tags', '/opportunities', '/events', '/podcasts']

if (![requestCount, concurrency, thresholdMs].every(Number.isFinite) || requestCount < 1 || concurrency < 1 || thresholdMs < 1) {
  throw new Error('Load-test settings must be positive numbers.')
}

const percentile = (values, fraction) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)]
}

const request = async (path) => {
  const startedAt = performance.now()
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  })
  const duration = performance.now() - startedAt
  await response.arrayBuffer()

  return { duration, ok: response.ok, status: response.status }
}

const runEndpoint = async (path) => {
  await request(path)

  const results = []
  let nextRequest = 0
  const workers = Array.from({ length: Math.min(concurrency, requestCount) }, async () => {
    while (nextRequest < requestCount) {
      nextRequest += 1
      results.push(await request(path))
    }
  })
  await Promise.all(workers)

  const failed = results.filter((result) => !result.ok)
  const durations = results.map((result) => result.duration)
  const summary = {
    endpoint: path,
    requests: results.length,
    failures: failed.length,
    average_ms: Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(2)),
    p50_ms: Number(percentile(durations, 0.5).toFixed(2)),
    p95_ms: Number(percentile(durations, 0.95).toFixed(2)),
    max_ms: Number(Math.max(...durations).toFixed(2)),
  }

  if (failed.length > 0) {
    const statuses = [...new Set(failed.map((result) => result.status))].join(', ')
    throw new Error(`${path} returned ${failed.length} failed responses (${statuses}).`)
  }

  return summary
}

const summaries = []
for (const endpoint of endpoints) {
  summaries.push(await runEndpoint(endpoint))
}

console.table(summaries)

const slowEndpoints = summaries.filter((summary) => summary.p95_ms > thresholdMs)
if (slowEndpoints.length > 0) {
  throw new Error(`The ${thresholdMs} ms p95 target was exceeded by: ${slowEndpoints.map((item) => item.endpoint).join(', ')}`)
}

console.log(`All endpoints met the ${thresholdMs} ms p95 response-time target.`)

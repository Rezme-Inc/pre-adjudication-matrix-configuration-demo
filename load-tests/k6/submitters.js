/**
 * k6 load test: simulate concurrent submitters writing decisions to Supabase
 *
 * Usage (install k6 locally):
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_ANON_KEY=your-anon-key \
 *   MATRIX_ID=your-matrix-id \
 *   k6 run load-tests/k6/submitters.js
 *
 * Notes:
 * - This script POSTS to Supabase REST endpoint (/rest/v1/decisions) using the anon key.
 * - It uses on_conflict + Prefer: resolution=merge-duplicates to behave like an upsert.
 * - Ensure your Supabase RLS policies permit the anon key to INSERT/UPSERT for this table
 *   (or run this test with a service key against a non-production DB).
 */

import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '30s', target: 200 }, // ramp up to 200 VUs
    { duration: '1m', target: 200 },  // stay at 200 VUs
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be < 1s
    'http_req_failed': ['rate<0.05'],    // <5% failed requests
  },
}

const SUPABASE_URL = __ENV.SUPABASE_URL
const ANON_KEY = __ENV.SUPABASE_ANON_KEY
const MATRIX_ID = __ENV.MATRIX_ID || 'load-test-matrix'

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set as environment variables')
  // k6 will still run, but requests will fail
}

const REST_ENDPOINT = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/decisions?on_conflict=matrix_id,collaborator_email,uccs_code`

function randomDecisionLevel() {
  const arr = ['Green', 'Yellow', 'Red']
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function () {
  // use the k6 virtual user id to create semi-unique emails per VU
  const collaborator_email = `user+${__VU}@example.com`
  const uccs_code = Math.floor(Math.random() * 100) + 100 // 100-199
  const decision_level = randomDecisionLevel()
  const look_back_period = Math.floor(Math.random() * 11) // 0-10 years

  const payload = JSON.stringify({
    matrix_id: MATRIX_ID,
    collaborator_email,
    uccs_code,
    decision_level,
    look_back_period,
  })

  const headers = {
    'Content-Type': 'application/json',
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    Prefer: 'return=representation, resolution=merge-duplicates',
  }

  const res = http.post(REST_ENDPOINT, payload, { headers })

  check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
  })

  // small random sleep to vary submission timing
  sleep(Math.random() * 1.5 + 0.1)
}

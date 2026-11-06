import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 20 }, // Ramp-up to 20 virtual users
    { duration: '30s', target: 50 }, // Sustained load at 50 virtual users
    { duration: '15s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'], // 95% of requests must complete within 400ms
    http_req_failed: ['rate<0.02'],   // Error rate under 2%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5001/api';

export default function () {
  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  // 2. Discover clubs
  const clubsRes = http.get(`${BASE_URL}/clubs?page=1&limit=10`);
  check(clubsRes, {
    'clubs list status is 200': (r) => r.status === 200,
    'clubs count > 0': (r) => JSON.parse(r.body).data.length > 0,
  });

  // 3. Discover events
  const eventsRes = http.get(`${BASE_URL}/events?upcoming=true`);
  check(eventsRes, {
    'events list status is 200': (r) => r.status === 200,
  });

  // 4. View leaderboard
  const leaderboardRes = http.get(`${BASE_URL}/contributions/leaderboard`);
  check(leaderboardRes, {
    'leaderboard status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

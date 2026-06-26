import assert from 'node:assert/strict';
import { shouldUseNativePdfViewer } from '../src/deviceUtils.js';

const cases = [
  {
    name: 'iPadOS desktop user agent',
    navigatorLike: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15',
      maxTouchPoints: 5,
    },
    expected: true,
  },
  {
    name: 'regular iPad user agent',
    navigatorLike: {
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      maxTouchPoints: 5,
    },
    expected: true,
  },
  {
    name: 'iPhone',
    navigatorLike: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)', maxTouchPoints: 5 },
    expected: true,
  },
  {
    name: 'Android',
    navigatorLike: { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)', maxTouchPoints: 5 },
    expected: true,
  },
  {
    name: 'Mac Safari',
    navigatorLike: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15',
      maxTouchPoints: 0,
    },
    expected: false,
  },
  {
    name: 'desktop Chrome',
    navigatorLike: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', maxTouchPoints: 0 },
    expected: false,
  },
];

for (const testCase of cases) {
  assert.equal(
    shouldUseNativePdfViewer(testCase.navigatorLike),
    testCase.expected,
    testCase.name,
  );
}

console.log(`device detection: ${cases.length} cases passed`);

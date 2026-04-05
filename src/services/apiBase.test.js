import { resolveApiBase, resolveApiTarget } from './apiBase.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

function createRuntime({ protocol = 'http:', hostname = '127.0.0.1', search = '' } = {}) {
  return {
    location: {
      protocol,
      hostname,
      search
    }
  };
}

assertEqual(
  resolveApiBase({ VITE_API_BASE: 'https://fixed.example.com/api' }, createRuntime()),
  'https://fixed.example.com/api',
  'resolveApiBase should prefer VITE_API_BASE when it is provided'
);

assertEqual(
  resolveApiTarget({}, createRuntime({ search: '?apiTarget=mock' })),
  'spring',
  'resolveApiTarget should stay on spring once production runtime cutover is complete'
);

assertEqual(
  resolveApiBase({}, createRuntime({ search: '?apiTarget=mock', hostname: 'demo.local' })),
  'http://demo.local:8081/api',
  'resolveApiBase should ignore runtime mock toggles and stay on the spring-app port'
);

assertEqual(
  resolveApiBase({}, createRuntime({ hostname: 'demo.local' })),
  'http://demo.local:8081/api',
  'resolveApiBase should default to the spring-app port once dual-run cutover is complete'
);

assertEqual(
  resolveApiBase(
    { VITE_SPRING_API_BASE: 'https://spring.example.com/api' },
    createRuntime()
  ),
  'https://spring.example.com/api',
  'resolveApiBase should respect an explicit spring-app base override'
);

assertEqual(
  resolveApiBase({ VITE_API_TARGET: 'mock' }, createRuntime({ hostname: 'demo.local' })),
  'http://demo.local:8081/api',
  'resolveApiBase should ignore legacy VITE_API_TARGET mock flags'
);

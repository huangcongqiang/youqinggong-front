import { resolveApiBase, resolveApiTarget } from './apiBase.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

function createRuntime({ protocol = 'http:', hostname = '127.0.0.1', search = '', storedTarget = '' } = {}) {
  const storage = new Map();
  if (storedTarget) {
    storage.set('youqinggong.api.target', storedTarget);
  }
  return {
    location: {
      protocol,
      hostname,
      search
    },
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, value);
      }
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
  'mock',
  'resolveApiTarget should read apiTarget from the current query string'
);

assertEqual(
  resolveApiBase({}, createRuntime({ search: '?apiTarget=mock', hostname: 'demo.local' })),
  'http://demo.local:8080/api',
  'resolveApiBase should use the root mock port when apiTarget=mock'
);

assertEqual(
  resolveApiBase({ VITE_API_TARGET: 'spring' }, createRuntime({ hostname: 'demo.local' })),
  'http://demo.local:8081/api',
  'resolveApiBase should use the spring-app port when the runtime target is spring'
);

assertEqual(
  resolveApiBase({}, createRuntime({ hostname: 'demo.local' })),
  'http://demo.local:8081/api',
  'resolveApiBase should default to the spring-app port once dual-run cutover is complete'
);

assertEqual(
  resolveApiBase(
    { VITE_API_TARGET: 'spring', VITE_SPRING_API_BASE: 'https://spring.example.com/api' },
    createRuntime()
  ),
  'https://spring.example.com/api',
  'resolveApiBase should respect an explicit spring-app base override when spring is the active target'
);

assertEqual(
  resolveApiBase(
    { VITE_ROOT_MOCK_API_BASE: 'https://mock.example.com/api' },
    createRuntime({ storedTarget: 'mock' })
  ),
  'https://mock.example.com/api',
  'resolveApiBase should respect an explicit root mock base override'
);

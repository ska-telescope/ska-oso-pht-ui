import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.stubEnv('BASE_URL', '/');
vi.stubEnv('BACKEND_URL', 'ska-ost-senscalc/senscalc/api/v11');
vi.stubEnv('ENVJS_FILE', './public/env.js');

afterEach(() => {
  cleanup();
});

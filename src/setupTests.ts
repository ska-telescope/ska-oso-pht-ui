// https://dev.to/eamonnprwalsh/migrating-from-jest-to-vitest-for-react-testing-ljn
// add Vitest functions here globally
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
// Extends Vitest's expect method with methods from react-testing-library
// https://github.com/testing-library/jest-dom?tab=readme-ov-file#with-vitest
import '@testing-library/jest-dom';

vi.mock('zustand'); // to make it works like Jest (auto-mocking)

vi.stubEnv('BASE_URL', '/');
vi.stubEnv('BACKEND_URL', 'https://192.168.49.2/ska-oso-odt-ui/odt/api/v1/sbds');
vi.stubEnv('ENVJS_FILE', './public/env.js');

const mockedUseNavigate = vi.fn();

const mockedUseState = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useState: (value: unknown) => [value, mockedUseState]
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: 'path'
    }),
    useNavigate: () => mockedUseNavigate
  };
});

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

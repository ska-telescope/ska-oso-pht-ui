import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('zustand');

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

vi.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {})
      }
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {}
  }
}));

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

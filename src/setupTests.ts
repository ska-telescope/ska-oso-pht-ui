import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// vi.mock('zustand');

vi.stubEnv('BASE_URL', '/');
vi.stubEnv('BACKEND_URL', 'https://192.168.49.2/ska-oso-odt-ui/odt/api/v1/sbds');
vi.stubEnv('ENVJS_FILE', './public/env.js');

// authConfig.ts's getUseIndigo() now defaults to true unless USE_INDIGO is explicitly 'false',
// matching how deployments are expected to be configured - so module-level code that reads
// env.INDIGO_* on the Indigo branch (e.g. axiosAuthClient.ts's loginRequest) needs these stubbed
// here too, or it throws at import time for every test file that pulls it in transitively.
vi.stubEnv('INDIGO_AUTHORITY', 'https://iam-1.staging.devx.skao.int/');
vi.stubEnv('INDIGO_CLIENT_ID', 'd546e462-637c-44ff-b2b9-3345a960ad42');
vi.stubEnv('INDIGO_SCOPE', 'pht:readwrite pht:read openid profile');
vi.stubEnv('INDIGO_AUDIENCE', 'test:pht');

const mockedUseState = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useState: (value: unknown) => [value, mockedUseState]
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockedUsedNavigate = vi.fn();

  return {
    ...actual,
    useLocation: () => ({
      pathname: 'path',
      state: {
        id: 'prsl-t0001-20250807-00001',
        proposal: {},
        sciReview: {
          comments: 'Gen comments 4',
          id: 'rvw-sci-DefaultUser-2025-08-07-00001-1411367',
          reviewerId: 'DefaultUser',
          reviewType: {
            excludedFromDecision: false,
            kind: 'Science Review',
            rank: 7
          },
          srcNet: 'SRC COMMENTS 2',
          status: 'Decided',
          submittedBy: 'DefaultUser',
          submittedOn: '2025-08-07T08:43:18.249000Z'
        },
        tecReview: {}
      }
    }),
    useNavigate: () => mockedUsedNavigate
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

vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
      create: vi.fn().mockReturnThis(),
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn()
        },
        response: {
          use: vi.fn(),
          eject: vi.fn()
        }
      }
    }
  };
});

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

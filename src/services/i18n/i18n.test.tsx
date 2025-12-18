import { renderHook } from '@testing-library/react';
import { useScopedTranslation } from './useScopedTranslation';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn().mockImplementation(namespaces => ({
    t: (key: string) => {
      if (key === 'existing.key') return 'Translated';
      return key;
    },
    i18n: {}
  }))
}));

vi.mock('@/utils/constants.ts', async importOriginal => {
  const actual = await importOriginal<typeof import('@/utils/constants.ts')>();
  return {
    ...actual,
    isCypress: false
  };
});

vi.mock('@/utils/appFlow/AppFlowContext', () => ({
  useAppFlow: () => ({ isSV: () => false })
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: { content8: null },
      updateAppContent8: vi.fn()
    })
  }
}));

describe('useScopedTranslation', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns translated value for existing key', () => {
    const { result } = renderHook(() => useScopedTranslation());
    expect(result.current.t('existing.key')).toBe('Translated');
  });

  it('returns key as is in production for missing key', () => {
    process.env.NODE_ENV = 'production';
    const { result } = renderHook(() => useScopedTranslation());
    expect(result.current.t('missing.key')).toBe('missing.key');
  });
});

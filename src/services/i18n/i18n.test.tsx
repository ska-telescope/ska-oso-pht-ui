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

vi.mock('@/utils/constants', () => ({
  isCypress: false
}));

vi.mock('@/utils/appFlow/AppFlowContext', () => ({
  useAppFlow: () => ({ isSV: () => false })
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

  it('returns key with emoji in development for missing key', () => {
    process.env.NODE_ENV = 'development';
    const { result } = renderHook(() => useScopedTranslation());
    expect(result.current.t('missing.key')).toBe('missing.key');
  });

  it('returns key as is in production for missing key', () => {
    process.env.NODE_ENV = 'production';
    const { result } = renderHook(() => useScopedTranslation());
    expect(result.current.t('missing.key')).toBe('missing.key');
  });
});

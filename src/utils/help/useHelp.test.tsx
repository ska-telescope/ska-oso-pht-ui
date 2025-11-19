// useHelp.test.tsx
import { renderHook } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { useHelp } from './useHelp';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

// Your wrapper from the app
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>
    <AppFlowProvider>{children}</AppFlowProvider>
  </StoreProvider>
);

// Mock translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      if (key.endsWith('.help')) return 'Mock help text';
      if (key.endsWith('.helpURL')) return 'https://mock-url.com';
      return key;
    }
  })
}));

describe('useHelp hook', () => {
  it('sets help text and URL when translations exist', () => {
    const { result } = renderHook(() => useHelp(), { wrapper });

    result.current.setHelp('email');

    // Now you can assert against the store state if needed,
    // or spy on storageObject.useStore() methods if you mock them.
    // For example:
    // expect(...).toEqual(...)
  });
});

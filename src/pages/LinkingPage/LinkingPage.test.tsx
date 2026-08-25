import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import LinkingPage, { isNonGaussianSensitivityCase } from './LinkingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'SKAO_2027_1',
    osdCycleDescription: 'Science Verification',
    osdOpens: () => '27-03-2026 12:00:00',
    osdCloses: () => '12-05-2026 04:00:00',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<LinkingPage />', () => {
  test('renders correctly with default values', () => {
    wrapper(<LinkingPage />);
  });

  test('treats Briggs robust=2 as non-Gaussian while leaving uniform alone', () => {
    expect(isNonGaussianSensitivityCase({ subarray: 'AA4', weighting: 2, robust: 2 })).toBe(true);
    expect(isNonGaussianSensitivityCase({ subarray: 'AA4', weighting: 1, robust: 2 })).toBe(false);
    expect(isNonGaussianSensitivityCase({ subarray: 'AA4', weighting: 0, robust: 0 })).toBe(true);
  });
});

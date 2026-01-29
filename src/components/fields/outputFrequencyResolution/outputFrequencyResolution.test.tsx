import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputFrequencyResolutionField from './outputFrequencyResolution';

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    observatoryConstants: { OutputFrequencyResolution: { min: 1, max: 1000 } }
  })
}));
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: () => {} })
}));

describe('<OutputFrequencyResolutionField />', () => {
  test('updates correctly when value changed', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const wrapper = screen.getByTestId('outputFrequencyResolution');
    const input = within(wrapper).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 250 } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(Number(250));
  });

  test('does not update when value changed to out of range', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const wrapper = screen.getByTestId('outputFrequencyResolution');
    const input = within(wrapper).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 10000000 } });
    fireEvent.blur(input);
    expect(handleSetValue).not.toHaveBeenCalled();
    expect(screen.getByText('outputFrequencyResolution.range.error')).toBeInTheDocument();
  });
});

import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputSamplingIntervalField from './outputSamplingInterval';

describe('<OutputSamplingIntervalField />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly with out of range value', () => {
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={10000000} />
      </StoreProvider>
    );
  });
  test('updates correctly when value changed', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const wrapper = screen.getByTestId('outputSamplingInterval');
    const input = within(wrapper).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith('250');
  });
});

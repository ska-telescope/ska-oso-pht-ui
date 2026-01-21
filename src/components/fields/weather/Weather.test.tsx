import { describe, it, expect, vi, test } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WeatherField from './Weather';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<WeatherField />', () => {
    const mockSetValue = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly', () => {
    wrapper(<WeatherField testId={'weather'} value={20} />);
  });

});
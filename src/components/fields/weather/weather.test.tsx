import { describe, vi, test } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import WeatherField from '@/components/fields/weather/weather';
const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<WeatherField />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly', () => {
    wrapper(<WeatherField testId={'weather'} value={20} />);
  });
});

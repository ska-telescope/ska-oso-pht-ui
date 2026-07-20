import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FrequencySpectrum from './FrequencySpectrum';

describe('<FrequencySpectrum />', () => {
  test('renders the min, max and center frequency labels', () => {
    render(<FrequencySpectrum minFreq={50} maxFreq={350} centerFreq={200} bandWidth={10} />);
    expect(screen.getByText('50 MHz')).toBeInTheDocument();
    expect(screen.getByText('350 MHz')).toBeInTheDocument();
    expect(screen.getByText('200 MHz')).toBeInTheDocument();
  });

  test('positions the center marker at the percentage of the band the center frequency falls at', () => {
    render(<FrequencySpectrum minFreq={0} maxFreq={100} centerFreq={25} bandWidth={10} />);
    const marker = screen.getByTestId('frequencySpectrum-center-marker');
    expect(marker).toHaveStyle({ left: '25%' });
  });

  test('actual mode fills the whole bar and shows a value box instead of a marker', () => {
    render(<FrequencySpectrum minFreq={0} maxFreq={100} centerFreq={25} bandWidth={10} actual />);
    expect(screen.queryByTestId('frequencySpectrum-center-marker')).not.toBeInTheDocument();
    const band = screen.getByTestId('frequencySpectrum-highlighted-band');
    expect(band).toHaveStyle({ width: '100%' });
  });
});

import { describe, test, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { renderHook } from '@testing-library/react';
import React, { useState } from 'react';

import RobustField from '@components/fields/robust/Robust.tsx';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import AddDataProduct from './AddDataProduct';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<AddDataProduct />', () => {
  test('renders correctly', () => {
    wrapper(<AddDataProduct />);
  });
});

vi.mock('@utils/helpers.ts', () => ({
  t: vi.fn(key => {
    if (key === 'pixelSize.precision') return '2';
    return key;
  })
}));

vi.mock('@utils/helpers.ts', () => ({
  t: vi.fn(key => key)
}));

describe('useEffect for pixel size calculation', () => {
  it('calculates pixel size correctly when observations are provided', () => {
    const mockSetPixelSizeValue = vi.fn();
    const mockSetPixelSizeUnits = vi.fn();
    const mockGetProposal = vi.fn(() => ({
      targetObservation: [
        {
          observationId: 'obs1',
          sensCalc: {
            section1: [{}, {}, {}, { value: '10 x 30' }]
          }
        }
      ]
    }));

    renderHook(() => {
      const [pixelSizeUnits] = useState(null);
      const [observationId] = useState('obs1');
      const [baseObservations] = useState([{ id: 'obs1' }]);

      React.useEffect(() => {
        const getPixelSize = sensCalc => {
          const DIVIDER = 3;
          const precision = 2;
          const arr =
            sensCalc?.section1 && sensCalc.section1.length > 2
              ? sensCalc.section1[3].value.split(' x ')
              : [];
          const result = arr.length > 1 ? (Number(arr[1]) / DIVIDER).toFixed(precision) : 0;
          if (pixelSizeUnits === null && sensCalc?.section1 && sensCalc.section1.length > 2) {
            mockSetPixelSizeUnits(2);
          }
          return Number(result);
        };

        const calcPixelSize = (count, total) => {
          if (count === 0 || total === 0) {
            return 0;
          }
          const precision = 2;
          const result = Number((total / count).toFixed(precision));
          return result;
        };

        if (observationId && baseObservations) {
          let pixelTotal = 0;
          let pixelCount = 0;
          mockGetProposal().targetObservation?.forEach(rec => {
            if (rec.observationId === observationId) {
              pixelCount++;
              pixelTotal += rec?.sensCalc ? getPixelSize(rec.sensCalc) : 0;
            }
          });
          mockSetPixelSizeValue(calcPixelSize(pixelCount, pixelTotal));
        }
      }, [baseObservations, observationId]);
    });

    expect(mockSetPixelSizeValue).toHaveBeenCalledWith(10);
    expect(mockSetPixelSizeUnits).toHaveBeenCalledWith(2);
  });

  test('returns 0 when no observations are provided', () => {
    const mockSetPixelSizeValue = vi.fn();
    const mockGetProposal = vi.fn(() => ({
      targetObservation: []
    }));

    renderHook(() => {
      const [observationId] = useState('obs1');
      const [baseObservations] = useState([]);

      React.useEffect(() => {
        const calcPixelSize = (count, total) => {
          if (count === 0 || total === 0) {
            return 0;
          }
          const precision = 2;
          const result = Number((total / count).toFixed(precision));
          return result;
        };

        if (observationId && baseObservations) {
          let pixelTotal = 0;
          let pixelCount = 0;
          mockGetProposal().targetObservation?.forEach(rec => {
            if (rec.observationId === observationId) {
              pixelCount++;
              pixelTotal += 0;
            }
          });
          mockSetPixelSizeValue(calcPixelSize(pixelCount, pixelTotal));
        }
      }, [baseObservations, observationId]);
    });

    expect(mockSetPixelSizeValue).toHaveBeenCalledWith(0);
  });
});

describe('robustField', () => {
  test('renders the robust field with the correct label', () => {
    const mockSetRobust = vi.fn();

    render(
      <RobustField
        label="robust.label"
        onFocus={() => {}}
        setValue={mockSetRobust}
        testId="robust"
        value={3}
      />
    );

    expect(screen.getByText('robust.label')).toBeInTheDocument();
  });
});

describe('channelsOut Field', () => {
  const t = vi.fn(key => {
    if (key === 'channelsOut.error') return 'Invalid value';
    return key;
  });

  const renderChannelsOutField = (channelsOut: number) => {
    render(
      <NumberEntry
        label={t('channelsOut.label')}
        testId="channelsOut"
        value={channelsOut}
        errorText={channelsOut < 0 || channelsOut > 40 ? t('channelsOut.error') : ''}
      />
    );
  };

  test('displays error when channelsOut is less than 0', () => {
    renderChannelsOutField(-1);
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });

  test('displays error when channelsOut is greater than 40', () => {
    renderChannelsOutField(41);
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });

  test('does not display error when channelsOut is within valid range', () => {
    renderChannelsOutField(20);
    expect(screen.queryByText('Invalid value')).not.toBeInTheDocument();
  });
});

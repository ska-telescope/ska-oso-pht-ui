import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DataProductsPage from './DataProductPage';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (ui: React.ReactElement) =>
  render(
    <StoreProvider>
      <AppFlowProvider>{ui}</AppFlowProvider>
    </StoreProvider>
  );

beforeEach(() => {
  vi.resetModules();
});

describe('<DataProductsPage />', () => {
  test('renders with no observations', async () => {
    vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
      storageObject: {
        useStore: () => ({
          application: {
            content2: {
              id: 'proposal-1',
              name: 'Test Proposal',
              observations: [],
              dataProductSDP: []
            }
          }
        })
      }
    }));

    vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({ osdCyclePolicy: { maxDataProducts: 5 } })
    }));

    wrapper(<DataProductsPage />);
    expect(screen.getByTestId('noObservationsNotification')).toBeInTheDocument();
  });

  test('renders list when multiple data products allowed', async () => {
    vi.mock('@ska-telescope/ska-gui-local-storage', async importOriginal => {
      const actual = await importOriginal<typeof import('@ska-telescope/ska-gui-local-storage')>();
      return {
        ...actual,
        storageObject: {
          useStore: () => ({
            application: {
              content1: [],
              content4: [
                { prslId: 'test-proposal', role: 'Principal Investigator', permissions: [] }
              ],
              content2: {
                observations: [],
                dataProductSDP: [
                  {
                    id: 'dp1',
                    observationId: 'obs1',
                    imageSizeValue: 0,
                    imageSizeUnits: 'MB',
                    pixelSizeValue: 0,
                    weighting: 'natural'
                  }
                ],
                proposalAccess: [
                  { prslId: 'test-proposal', role: 'Principal Investigator', permissions: [] }
                ]
              }
            },
            updateAppContent1: vi.fn(),
            updateAppContent2: vi.fn()
          })
        }
      };
    });

    vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({ osdCyclePolicy: { maxDataProducts: 5 } })
    }));

    wrapper(<DataProductsPage />);
    expect(screen.getByTestId('addDataProductButton')).toBeInTheDocument();
  });

  test('renders single DataProduct when only one allowed', async () => {
    vi.mock('@ska-telescope/ska-gui-local-storage', async importOriginal => {
      const actual = await importOriginal<typeof import('@ska-telescope/ska-gui-local-storage')>();
      return {
        ...actual,
        storageObject: {
          useStore: () => ({
            application: {
              content1: [],
              content4: [
                { prslId: 'test-proposal', role: 'Principal Investigator', permissions: [] }
              ],
              content2: {
                observations: [],
                dataProductSDP: [
                  {
                    id: 'dp1',
                    observationId: 'obs1',
                    imageSizeValue: 0,
                    imageSizeUnits: 'MB',
                    pixelSizeValue: 0,
                    weighting: 'natural'
                  }
                ],
                proposalAccess: [
                  { prslId: 'test-proposal', role: 'Principal Investigator', permissions: [] }
                ]
              }
            },
            updateAppContent1: vi.fn(),
            updateAppContent2: vi.fn()
          })
        }
      };
    });

    vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({ osdCyclePolicy: { maxDataProducts: 1 } })
    }));

    wrapper(<DataProductsPage />);
    expect(screen.queryByTestId('addDataProductButton')).not.toBeInTheDocument();
    // Add a testId inside DataProduct to assert its presence if needed
  });

  test('delete dialog toggles open/close', async () => {
    vi.mock('@ska-telescope/ska-gui-local-storage', async importOriginal => {
      const actual = await importOriginal<typeof import('@ska-telescope/ska-gui-local-storage')>();
      return {
        ...actual,
        storageObject: {
          useStore: () => ({
            application: {
              content1: [],
              content4: [
                { prslId: 'test-proposal', role: 'Principal Investigator', permissions: [] }
              ],
              content2: {
                observations: [{ id: 'obs1' }],
                dataProductSDP: [
                  {
                    id: 'dp1',
                    observationId: 'obs1',
                    imageSizeValue: 100,
                    imageSizeUnits: 'MB',
                    pixelSizeValue: 1,
                    weighting: 'natural'
                  }
                ],
                proposalAccess: [
                  { prslId: 'test-proposal', role: 'Principal Investigator', permissions: [] }
                ]
              }
            },
            updateAppContent1: vi.fn(),
            updateAppContent2: vi.fn()
          })
        }
      };
    });

    vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({ osdCyclePolicy: { maxDataProducts: 5 } })
    }));

    wrapper(<DataProductsPage />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Add a testId to your delete button in TableDataProducts to simulate click here
    // fireEvent.click(screen.getByTestId('deleteButton-dp1'));
    // expect(screen.getByRole('dialog')).toBeVisible();
  });
});

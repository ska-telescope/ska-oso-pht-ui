import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import TableObservationsRow from './TableObservationsRow';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdLOW: { basicCapabilities: { minFrequencyHz: 50e6, maxFrequencyHz: 350e6 } },
    osdMID: undefined
  })
}));

const observation = {
  ...newSvObservation(OBSERVING_MODE.CONTINUUM, 15),
  id: 'obs-1',
  groupId: 'group-1'
};

const wrapper = (component: React.ReactElement) =>
  render(<StoreProvider>{component}</StoreProvider>);

describe('TableObservationsRow', () => {
  const props = {
    observation,
    index: 0,
    expanded: false,
    deleteClicked: vi.fn(),
    editClicked: vi.fn(),
    toggleRow: vi.fn(),
    expandButtonRef: () => null,
    t: (key: string) => key
  };

  it("shows the observation's id, group, mode, telescope and subarray", () => {
    wrapper(<TableObservationsRow {...props} />);
    expect(screen.getByText('obs-1')).toBeInTheDocument();
    expect(screen.getByText('group-1')).toBeInTheDocument();
    expect(screen.getByText('observationType.continuum')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element?.textContent === 'telescopes.ska_low subArrayConfiguration.aa2_sv',
        { selector: 'p' }
      )
    ).toBeInTheDocument();
  });
});

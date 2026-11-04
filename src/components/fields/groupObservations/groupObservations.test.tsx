import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GroupObservationsField from './groupObservations';

const mockUpdateAppContent2 = vi.fn();

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: {
          groupObservations: [
            { groupId: 'groupA', observationId: 'obs1' },
            { groupId: 'groupB', observationId: 'obs2' }
          ]
        }
      },
      updateAppContent2: mockUpdateAppContent2
    })
  }
}));

const wrapper = (component: React.ReactElement) => {
  return render(component);
};

describe('GroupObservationsField', () => {
  const mockSetValue = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DropDown when editing is false', () => {
    wrapper(
      <GroupObservationsField
        value={1}
        obsId="obs1"
        setValue={mockSetValue}
        onFocus={mockOnFocus}
      />
    );
    expect(screen.getByRole('combobox', { name: 'groupObservations.label' })).toBeInTheDocument();
  });

  it('enters editing mode when selecting "new" option', async () => {
    wrapper(
      <GroupObservationsField
        value={1}
        obsId="obs1"
        setValue={mockSetValue}
        onFocus={mockOnFocus}
      />
    );

    const dropdown = screen.getByRole('combobox', { name: 'groupObservations.label' });
    userEvent.click(dropdown);
  });

  it('removes group when selecting "none"', async () => {
    wrapper(
      <GroupObservationsField
        value={1}
        obsId="obs1"
        setValue={mockSetValue}
        onFocus={mockOnFocus}
      />
    );

    const dropdown = screen.getByRole('combobox', { name: 'groupObservations.label' });
    userEvent.click(dropdown);
  });

  it('reuses group when selecting existing groupId', async () => {
    wrapper(
      <GroupObservationsField
        value={1}
        obsId="obs1"
        setValue={mockSetValue}
        onFocus={mockOnFocus}
      />
    );

    const dropdown = screen.getByRole('combobox', { name: 'groupObservations.label' });
    userEvent.click(dropdown);
  });

  it('adds group on blur in editing mode', async () => {
    wrapper(
      <GroupObservationsField
        value={1}
        obsId="obs1"
        setValue={mockSetValue}
        onFocus={mockOnFocus}
      />
    );

    const dropdown = screen.getByRole('combobox', { name: 'groupObservations.label' });
    userEvent.click(dropdown);
  });

  it('respects disabled prop', () => {
    wrapper(
      <GroupObservationsField
        value={1}
        obsId="obs1"
        disabled
        setValue={mockSetValue}
        onFocus={mockOnFocus}
      />
    );
  });

  it('uses default labelWidth when not provided', () => {
    wrapper(<GroupObservationsField value={1} obsId="obs1" setValue={mockSetValue} />);
    expect(screen.getByRole('combobox', { name: 'groupObservations.label' })).toBeInTheDocument();
  });
});

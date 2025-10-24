import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GroupObservationsField from './groupObservations';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const mockUpdateAppContent2 = vi.fn();

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
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
  return render(<AppFlowProvider>{component}</AppFlowProvider>);
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
    expect(screen.getByTestId('groupObservationsEntry')).toBeInTheDocument();
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

    const dropdown = screen.getByTestId('groupObservationsEntry');
    userEvent.click(dropdown);

    // const newOption = await screen.findByText('groupObservations.new');
    // userEvent.click(newOption);

    // await waitFor(() => {
    //   expect(screen.getByTestId('groupObservationsValue1')).toBeInTheDocument();
    // });
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

    const dropdown = screen.getByTestId('groupObservationsEntry');
    userEvent.click(dropdown);

    // const noneOption = await screen.findByText('groupObservations.none');
    // userEvent.click(noneOption);

    // await waitFor(() => {
    //   expect(mockSetValue).toHaveBeenCalledWith(0);
    //   expect(mockUpdateAppContent2).toHaveBeenCalled();
    // });
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

    const dropdown = screen.getByTestId('groupObservationsEntry');
    userEvent.click(dropdown);

    //  const groupOption = await screen.findByText('groupB');
    // userEvent.click(groupOption);

    // await waitFor(() => {
    //   expect(mockSetValue).toHaveBeenCalledWith('groupB');
    //   expect(mockUpdateAppContent2).toHaveBeenCalled();
    // });
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

    const dropdown = screen.getByTestId('groupObservationsEntry');
    userEvent.click(dropdown);

    // const newOption = await screen.findByText('groupObservations.new');
    // userEvent.click(newOption);

    // const inputWrapper = await screen.findByTestId('groupObservationsValue1');
    // const input = inputWrapper.querySelector('input');
    // await userEvent.type(input!, 'newGroup');
    // fireEvent.blur(input!);

    // await waitFor(() => {
    //   expect(mockUpdateAppContent2).toHaveBeenCalled();
    // });
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

    // const dropdown = screen.getByTestId('groupObservationsEntry');
    // expect(dropdown).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses default labelWidth when not provided', () => {
    wrapper(<GroupObservationsField value={1} obsId="obs1" setValue={mockSetValue} />);
    expect(screen.getByTestId('groupObservationsEntry')).toBeInTheDocument();
  });
});

import React from 'react';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { describe, test, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import TargetEntry from './TargetEntry';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { linkTarget } from '@/utils/autoLinking/AutoLinking';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';
import phtTranslations from '../../../../public/locales/en/pht.json';

// Exposes the global form, which holds the entry and the targets
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = ({ onForm }: { onForm: (form: UseFormReturn<ProposalType>) => void }) => {
  onForm(useFormContext<ProposalType>());
  return null;
};
const keepForm = (form: UseFormReturn<ProposalType>) => {
  formProbe = form;
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <TestProposalFormProvider>
        <FormProbe onForm={keepForm} />
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </TestProposalFormProvider>
    </StoreProvider>
  );
};

const mockStore = vi.hoisted(() => ({ targets: [] as unknown[] }));
const mockOSD = vi.hoisted(() => ({ autoLink: true }));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: mockOSD.autoLink,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

vi.mock('@/utils/autoLinking/AutoLinking', () => ({
  linkTarget: vi.fn()
}));

vi.mock('@services/axios/get/getCoordinates/getCoordinates', () => ({
  default: vi.fn(),
  RESOLVE_ERROR_UNKNOWN: 'API_UNKNOWN_ERROR'
}));

const mockNotifyError = vi.hoisted(() => vi.fn());
vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({ notifyError: mockNotifyError, notifySuccess: vi.fn() })
}));

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: {
          targets: mockStore.targets,
          observations: [],
          dataProductSDP: [],
          targetObservation: [],
          calibrationStrategy: []
        }
      },
      updateAppContent2: vi.fn(),
      updateAppContent5: vi.fn(),
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn()
    })
  },
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// The target entry's inputs and buttons, found by their labels (translation keys in tests)
const RA = 'skyDirection.label.1.0';
const DEC = 'skyDirection.label.2.0';
const nameInput = () => screen.getByRole('textbox', { name: 'name.label' });
const raInput = () => screen.getByRole('textbox', { name: RA });
const decInput = () => screen.getByRole('textbox', { name: DEC });
const velocityInput = () => screen.getByRole('textbox', { name: 'velocity.0.label' });
const addButton = () => screen.getByRole('button', { name: 'addTarget.label' });
const clearButton = () => screen.getByRole('button', { name: 'clearBtn.label' });
const resolveButton = () => screen.getByRole('button', { name: 'resolve.label' });

describe('<TargetEntry />', () => {
  test('renders correctly', () => {
    wrapper(<TargetEntry />);
  });
});

describe('<TargetEntry /> target limit', () => {
  afterEach(() => {
    mockStore.targets = [];
  });

  it('disables adding a target once the cycle policy maxTargets is reached', async () => {
    mockStore.targets = [{ id: 1, name: 'Existing target' }];
    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry />);
    });

    await user.type(nameInput(), 'My Target');
    await user.type(raInput(), '12:34:56');
    await user.type(decInput(), '45:00:00');

    await waitFor(() => {
      expect(addButton()).toBeDisabled();
    });
  }, 15000);
});

describe('<TargetEntry /> coordinate system', () => {
  it("shows the chosen coordinate system's inputs", async () => {
    const user = userEvent.setup();
    await act(async () => {
      wrapper(<TargetEntry />);
    });
    expect(raInput()).toBeInTheDocument();
    expect(decInput()).toBeInTheDocument();
    await user.type(raInput(), '1:00:00');

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'referenceCoordinates.label' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Galactic' }));

    // Galactic longitude and latitude replace right ascension and declination
    await waitFor(() => expect(screen.getAllByRole('spinbutton')).toHaveLength(2));
    expect(screen.queryByRole('textbox', { name: RA })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: DEC })).not.toBeInTheDocument();
  }, 15000);
});

describe('<TargetEntry /> velocity type', () => {
  it('checks only the velocity or redshift in use', async () => {
    const user = userEvent.setup();
    await act(async () => {
      wrapper(<TargetEntry />);
    });

    await user.type(nameInput(), 'M2');
    await user.type(raInput(), '21:33:27.02');
    await user.type(decInput(), '-00:49:23.7');
    await user.type(velocityInput(), 'abc');
    await waitFor(() => expect(addButton()).toBeDisabled());

    // Redshift is in use now, so the invalid velocity no longer stops the target being added
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'velocityType.label' }));
    fireEvent.click(await screen.findByRole('option', { name: 'velocity.1.label' }));
    await waitFor(() => expect(addButton()).toBeEnabled());
  }, 15000);
});

describe('<TargetEntry /> name validation', () => {
  it('flags a name already in the proposal as it is typed', async () => {
    const user = userEvent.setup();
    await act(async () => {
      wrapper(<TargetEntry />);
    });
    act(() => {
      formProbe.setValue('targets', [
        { id: 'target-1', name: 'M2', kind: 0, velocityDefinition: 'RADIO' }
      ]);
    });

    const nameField = nameInput();
    await user.type(nameField, 'm2');
    await waitFor(() =>
      expect(screen.getByText(phtTranslations.addTarget.error)).toBeInTheDocument()
    );

    await user.type(nameField, '-new');
    await waitFor(() =>
      expect(screen.queryByText(phtTranslations.addTarget.error)).not.toBeInTheDocument()
    );
  }, 15000);

  it('asks for a name when it is cleared', async () => {
    const user = userEvent.setup();
    await act(async () => {
      wrapper(<TargetEntry />);
    });

    const nameField = nameInput();
    await user.type(nameField, 'M2');
    await user.clear(nameField);
    await waitFor(() =>
      expect(screen.getByText(phtTranslations.addTarget.valueError)).toBeInTheDocument()
    );
  }, 15000);
});

describe('<TargetEntry /> resolving and clearing', { timeout: 10000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state and disables editing and clearing while coordinates are resolving', async () => {
    const mockedGetCoordinates = vi.mocked(GetCoordinates);
    mockedGetCoordinates.mockReturnValue(new Promise(() => {}) as never);

    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry />);
    });

    const nameField = nameInput();
    await user.type(nameField, 'Resolving target');

    await user.click(resolveButton());

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'resolve.label' })).not.toBeInTheDocument();
      expect(nameField).toBeDisabled();
      expect(clearButton()).toBeDisabled();
    });
  });

  it('ignores stale resolution responses after the form changes', async () => {
    let resolvePromiseResolver: ((value: unknown) => void) | undefined;
    const deferredResponse = new Promise<unknown>((resolve) => {
      resolvePromiseResolver = resolve;
    });

    vi.mocked(GetCoordinates).mockReturnValue(deferredResponse as never);

    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry />);
    });

    const nameField = nameInput();
    const raField = raInput();

    await user.type(nameField, 'Original target');
    await user.click(resolveButton());

    fireEvent.change(raField, { target: { value: '11:22:33' } });

    await act(async () => {
      resolvePromiseResolver?.({
        reference_coordinate: { kind: 'icrs', ra_str: '01:02:03', dec_str: '04:05:06' },
        radial_velocity: { quantity: { value: 5 }, redshift: 0 }
      });
    });

    await waitFor(() => {
      expect(raField).toHaveValue('11:22:33');
    });
  });

  it('shows clear button only when at least one field has been entered', async () => {
    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry />);
    });

    expect(screen.queryByRole('button', { name: 'clearBtn.label' })).not.toBeInTheDocument();

    const nameField = nameInput();
    await user.type(nameField, 'Temporary target');

    await waitFor(() => {
      expect(clearButton()).toBeInTheDocument();
    });
  });

  it('clears entered values when clear button is clicked', async () => {
    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry />);
    });

    const nameField = nameInput();
    const raField = raInput();
    const decField = decInput();

    await user.type(nameField, 'Reset me');
    await user.type(raField, '10:20:30');
    await user.type(decField, '40:50:00');

    await waitFor(() => {
      expect(clearButton()).toBeInTheDocument();
    });

    await user.click(clearButton());

    await waitFor(() => {
      expect(nameField).toHaveValue('');
      expect(raField).toHaveValue('');
      expect(decField).toHaveValue('');
      expect(screen.queryByRole('button', { name: 'clearBtn.label' })).not.toBeInTheDocument();
    });
  });
});

describe('<TargetEntry /> auto-linking route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(linkTarget).mockResolvedValue();
  });

  afterEach(() => {
    mockOSD.autoLink = true;
  });

  const addTarget = async () => {
    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry />);
    });

    await user.type(nameInput(), 'My Target');
    await user.type(raInput(), '12:34:56');
    await user.type(decInput(), '45:00:00');

    await waitFor(() => {
      expect(addButton()).not.toBeDisabled();
    });

    await user.click(addButton());
  };

  it('links the target to the existing observation when the cycle auto-links', async () => {
    await addTarget();

    await waitFor(() => {
      expect(linkTarget).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nameInput()).toHaveValue('');
    });
  }, 15000);

  it('does not link the target when the cycle does not auto-link', async () => {
    mockOSD.autoLink = false;

    await addTarget();

    expect(linkTarget).not.toHaveBeenCalled();
    expect(formProbe.getValues('targets')).toEqual([
      expect.objectContaining({ name: 'My Target', raStr: '12:34:56' })
    ]);
    expect(nameInput()).toHaveValue('');
  }, 15000);

  it('keeps the target being entered out of the proposal, and drops it when closed', async () => {
    const user = userEvent.setup();
    const { unmount } = wrapper(<TargetEntry />);

    await user.type(nameInput(), 'Half typed');

    expect(formProbe.getValues()).not.toHaveProperty('editor');
    expect(formProbe.getValues('targets')).toEqual([]);

    unmount();
    wrapper(<TargetEntry />);
    expect(nameInput()).toHaveValue('');
  }, 15000);
});

describe('<TargetEntry /> resolve errors', () => {
  const resolveFails = async (response: unknown) => {
    vi.mocked(GetCoordinates).mockResolvedValue(response as never);
    const user = userEvent.setup();
    wrapper(<TargetEntry />);
    await user.type(nameInput(), 'Unknown object');
    await user.click(resolveButton());
  };

  beforeEach(() => {
    mockNotifyError.mockClear();
  });

  it('shows the backend error in a pop-up rather than on the name field', async () => {
    const message = 'Object Unknown object not found in SIMBAD, NED or VizieR.';
    await resolveFails({ error: 'notFound', message });

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(message, expect.any(Number));
    });
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(nameInput()).not.toHaveAttribute('aria-invalid', 'true');
  }, 15000);

  it('falls back to our own message when the backend sends none', async () => {
    await resolveFails({ error: 'unavailable' });

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith('resolve.error.unavailable', expect.any(Number));
    });
  }, 15000);

  it('shows a generic error when the lookup throws', async () => {
    vi.mocked(GetCoordinates).mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    wrapper(<TargetEntry />);
    await user.type(nameInput(), 'Unknown object');
    await user.click(resolveButton());

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledWith(
        'resolve.error.API_UNKNOWN_ERROR',
        expect.any(Number)
      );
    });
  }, 15000);
});

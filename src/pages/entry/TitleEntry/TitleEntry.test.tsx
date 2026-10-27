import { beforeEach, describe, test, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import TitleEntry from './TitleEntry';
import { PROPOSAL_TYPE } from '@/utils/constants';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProposalSchema, ProposalType } from '@/models/proposals/proposal';
import phtTranslations from '../../../../public/locales/en/pht.json';

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ isSV: false })
}));

// A single store object, so TitleEntry's effect on application.content2 doesn't re-run every render
const mockStore = vi.hoisted(() => ({
  application: {
    content1: [],
    content2: { title: 'A title', proposalType: undefined, proposalSubType: [] }
  },
  updateAppContent1: () => {},
  updateAppContent2: vi.fn()
}));

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => mockStore
  },
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const wrapper = (
  component: React.ReactElement,
  {
    validate = false,
    proposalType
  }: { validate?: boolean; proposalType?: ProposalType['proposalType'] } = {}
) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      mode: 'all',
      defaultValues: { title: 'A title', proposalType },
      resolver: validate ? zodResolver(getProposalSchema()) : undefined
    });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          {component}
          <output data-testid="formProposalType">{methods.watch('proposalType')}</output>
        </FormProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
};

describe('<TitleEntry />', () => {
  test('renders correctly', () => {
    wrapper(<TitleEntry page={0} />);
  });

  test('offers every proposal type except science verification', () => {
    const { container } = wrapper(<TitleEntry page={0} />);
    [PROPOSAL_TYPE.STANDARD, PROPOSAL_TYPE.KEY_SCIENCE, PROPOSAL_TYPE.DIRECTOR_TIME].forEach(
      (type) => expect(container.querySelector(`#ProposalType-${type}`)).toBeInTheDocument()
    );
    expect(
      container.querySelector(`#ProposalType-${PROPOSAL_TYPE.SCIENCE_VERIFICATION}`)
    ).not.toBeInTheDocument();
  });

  test('saves title changes from the RHF field to the proposal', () => {
    wrapper(<TitleEntry page={0} />);
    const titleInput = screen.getByTestId('titleId');

    expect(titleInput.tagName).toBe('INPUT');
    fireEvent.change(titleInput, { target: { value: 'Updated title' } });

    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated title' })
    );
  });

  test('saves a selected type to the form and the proposal', async () => {
    const { container } = wrapper(<TitleEntry page={0} />, { validate: true });
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.KEY_SCIENCE}`)!);

    await waitFor(() =>
      expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.KEY_SCIENCE)
    );
    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({ proposalType: PROPOSAL_TYPE.KEY_SCIENCE })
    );
    expect(screen.queryByTestId('dialogConfirmationButton')).not.toBeInTheDocument();
  });

  test('only changes the form type and clears subtypes after confirmation', async () => {
    const { container } = wrapper(<TitleEntry page={0} />, {
      proposalType: PROPOSAL_TYPE.STANDARD
    });
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.KEY_SCIENCE}`)!);
    expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.STANDARD);

    fireEvent.click(screen.getByTestId('dialogConfirmationButton'));
    await waitFor(() =>
      expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.KEY_SCIENCE)
    );
    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({
        proposalType: PROPOSAL_TYPE.KEY_SCIENCE,
        proposalSubType: []
      })
    );
  });

  test('keeps the selected form type when a change is cancelled', () => {
    const { container } = wrapper(<TitleEntry page={0} />, {
      proposalType: PROPOSAL_TYPE.STANDARD
    });
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.KEY_SCIENCE}`)!);
    fireEvent.click(screen.getByTestId('dialogCancelButton'));

    expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.STANDARD);
    expect(mockStore.updateAppContent2).not.toHaveBeenCalledWith(
      expect.objectContaining({ proposalType: PROPOSAL_TYPE.KEY_SCIENCE })
    );
  });
});

describe('<TitleEntry /> validation', () => {
  test('shows the zod error when the title is cleared', async () => {
    wrapper(<TitleEntry page={0} />, { validate: true });

    fireEvent.change(screen.getByTestId('titleId'), { target: { value: '' } });

    expect((await screen.findAllByText(phtTranslations.title.empty))[0]).toBeInTheDocument();
  });

  test('shows the zod error for unsupported characters', async () => {
    wrapper(<TitleEntry page={0} />, { validate: true });

    fireEvent.change(screen.getByTestId('titleId'), { target: { value: 'A title with @' } });

    expect(
      (await screen.findAllByText(phtTranslations.specialCharacters.invalid))[0]
    ).toBeInTheDocument();
  });
});

describe('Title helperFunction', () => {
  const t = vi.fn((key, params) => {
    if (key === 'title.helper') {
      return `Current: ${params.current}, Max: ${params.max}`;
    }
  });
  const countWords = vi.fn();

  const helperFunction = (title: string) => {
    const color = 'red'; // Simplified for testing
    const baseHelperText = t('title.helper', {
      current: countWords(title),
      max: 10
    });
    return countWords(title) > 10 ? (
      <>
        {baseHelperText} <span style={{ color: color }}>(WORD LIMIT EXCEEDED)</span>
      </>
    ) : (
      baseHelperText
    );
  };

  test('returns helper text without over-limit message when word count is below max', () => {
    countWords.mockReturnValue(8);
    const result = helperFunction('This title has less than ten words altogether');
    expect(result).toBe('Current: 8, Max: 10');
  });

  test('returns helper text without over-limit message when word count equals max', () => {
    countWords.mockReturnValue(10);
    const result = helperFunction('This title has a word count of exactly ten words');
    expect(result).toBe('Current: 10, Max: 10');
  });

  test('appends word limit exceeded message when word count exceeds max', () => {
    countWords.mockReturnValue(12);
    const { container } = wrapper(
      <>{helperFunction('This title has a word count that goes well beyond the maximum limit')}</>
    );
    expect(container.textContent).toContain('Current: 12, Max: 10');
    expect(container.textContent).toContain('(WORD LIMIT EXCEEDED)');
  });
});

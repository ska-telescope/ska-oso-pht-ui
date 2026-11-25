import { beforeEach, describe, test, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import TitleEntry from './TitleEntry';
import { PROPOSAL_SUBTYPE, PROPOSAL_TYPE } from '@/utils/constants';
import { FormProvider, useForm } from 'react-hook-form';
import { ProposalType, getProposalResolver } from '@/models/proposals/proposal';
import phtTranslations from '../../../../public/locales/en/pht.json';

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ isSV: false })
}));

const mockStore = vi.hoisted(() => ({
  application: { content1: [] },
  updateAppContent1: () => {}
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
    proposalType = { type: null, subTypes: [] }
  }: { validate?: boolean; proposalType?: ProposalType['proposalType'] } = {}
) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      mode: 'all',
      defaultValues: { title: 'A title', proposalType },
      resolver: validate ? getProposalResolver() : undefined
    });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          {component}
          <output data-testid="formTitle">{methods.watch('title')}</output>
          <output data-testid="formProposalType">{methods.watch('proposalType.type')}</output>
          <output data-testid="formSubTypes">
            {methods.watch('proposalType.subTypes').join(',')}
          </output>
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

  test('puts title changes in the form', () => {
    wrapper(<TitleEntry page={0} />);
    const titleInput = screen.getByTestId('titleId');

    expect(titleInput.tagName).toBe('INPUT');
    fireEvent.change(titleInput, { target: { value: 'Updated title' } });

    expect(screen.getByTestId('formTitle')).toHaveTextContent('Updated title');
  });

  test('puts a selected type in the form', async () => {
    const { container } = wrapper(<TitleEntry page={0} />, { validate: true });
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.KEY_SCIENCE}`)!);

    await waitFor(() =>
      expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.KEY_SCIENCE)
    );
    expect(screen.queryByTestId('dialogConfirmationButton')).not.toBeInTheDocument();
  });

  test('only changes the form type and clears subtypes after confirmation', async () => {
    const { container } = wrapper(<TitleEntry page={0} />, {
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [PROPOSAL_SUBTYPE.JOINT] }
    });
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.KEY_SCIENCE}`)!);
    expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.STANDARD);
    expect(screen.getByTestId('formSubTypes')).toHaveTextContent(PROPOSAL_SUBTYPE.JOINT);

    fireEvent.click(screen.getByTestId('dialogConfirmationButton'));
    await waitFor(() =>
      expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.KEY_SCIENCE)
    );
    expect(screen.getByTestId('formSubTypes')).toBeEmptyDOMElement();
  });

  test('picks and unpicks a sub-type in the form', () => {
    const { container } = wrapper(<TitleEntry page={0} />, {
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] }
    });
    const joint = container.querySelector(`#proposalAttribute-${PROPOSAL_SUBTYPE.JOINT}`)!;

    fireEvent.click(joint);
    expect(screen.getByTestId('formSubTypes')).toHaveTextContent(PROPOSAL_SUBTYPE.JOINT);

    fireEvent.click(joint);
    expect(screen.getByTestId('formSubTypes')).toBeEmptyDOMElement();
  });

  test('keeps the selected form type when a change is cancelled', () => {
    const { container } = wrapper(<TitleEntry page={0} />, {
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] }
    });
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.KEY_SCIENCE}`)!);
    fireEvent.click(screen.getByTestId('dialogCancelButton'));

    expect(screen.getByTestId('formProposalType')).toHaveTextContent(PROPOSAL_TYPE.STANDARD);
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

import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import ProposalDisplay from './ProposalDisplay';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<ProposalDisplay />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    wrapper(<ProposalDisplay proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
  });
  test('renders correctly ( no type )', () => {
    wrapper(
      <ProposalDisplay
        proposal={{
          ...getProposalFormDefaults(),
          title: '',
          proposalType: { type: null, subTypes: [] },
          scienceCategory: null,
          abstract: ''
        }}
        open={true}
        onClose={mockActionClose}
        onConfirm={mockActionConfirm}
      />
    );
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockActionClose).toBeCalled();
  });
  test('renders correctly ( standard type with sub-type )', () => {
    wrapper(
      <ProposalDisplay
        proposal={{
          ...getProposalFormDefaults(),
          title: '',
          proposalType: { type: 'standard_proposal', subTypes: ['target_of_opportunity'] },
          scienceCategory: 1,
          abstract: 'This is an abstract for a proposal.'
        }}
        open={true}
        onClose={mockActionClose}
        onConfirm={mockActionConfirm}
      />
    );
    expect(screen.getByText('proposalType.title.standard_proposal')).toBeInTheDocument();
    expect(screen.getByText('proposalAttribute.title.target_of_opportunity')).toBeInTheDocument();
  });

  test('does not show raw latex syntax in rendered title output', () => {
    const longLatexTitle = '$\\frac{1234567890123456789012345678901234567890}{x}$';

    wrapper(
      <ProposalDisplay
        proposal={{
          ...getProposalFormDefaults(),
          title: longLatexTitle,
          proposalType: { type: null, subTypes: [] },
          scienceCategory: null,
          abstract: ''
        }}
        open={true}
        onClose={mockActionClose}
        onConfirm={mockActionConfirm}
      />
    );

    const renderedFraction = document.querySelector('#title .katex .mfrac');
    expect(renderedFraction).toBeInTheDocument();
    const renderedLatex = document.querySelector('#title .katex-html');
    expect(renderedLatex).toBeInTheDocument();
    expect(renderedLatex).not.toHaveTextContent(/\\[a-zA-Z]+/);

    const titleContainer = screen.getByTestId('proposal-title-latex');
    expect(titleContainer).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });
});

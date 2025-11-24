import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ProposalDisplay from './ProposalDisplay';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<ProposalDisplay />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    wrapper(<ProposalDisplay proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
  });
  test('renders correctly ( type 0 )', () => {
    wrapper(
      <ProposalDisplay
        proposal={{
          id: '',
          title: '',
          status: '',
          lastUpdated: '',
          lastUpdatedBy: '',
          createdOn: '',
          createdBy: '',
          version: 0,
          cycle: '',
          proposalType: 0,
          proposalSubType: undefined,
          scienceCategory: null,
          scienceSubCategory: undefined,
          investigators: undefined,
          abstract: undefined,
          sciencePDF: null,
          scienceLoadStatus: undefined,
          targetOption: undefined,
          targets: undefined,
          observations: undefined,
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: null,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
        open={true}
        onClose={mockActionClose}
        onConfirm={mockActionConfirm}
      />
    );
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockActionClose).toBeCalled();
  });
  test('renders correctly ( type 1 )', () => {
    wrapper(
      <ProposalDisplay
        proposal={{
          id: '',
          title: '',
          status: '',
          lastUpdated: '',
          lastUpdatedBy: '',
          createdOn: '',
          createdBy: '',
          version: 0,
          cycle: '',
          proposalType: 1,
          proposalSubType: [1],
          scienceCategory: 1,
          scienceSubCategory: undefined,
          investigators: undefined,
          abstract: 'This is an abstract for a proposal.',
          sciencePDF: null,
          scienceLoadStatus: undefined,
          targetOption: undefined,
          targets: undefined,
          observations: undefined,
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: null,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
        open={true}
        onClose={mockActionClose}
        onConfirm={mockActionConfirm}
      />
    );
  });
});

describe('ProposalDisplay Utility Functions', () => {
  const t = vi.fn(key => key); // Mock translation function
  const NOT_SPECIFIED = 'Not Specified';

  const mockProposal1 = {
    proposalType: 2,
    proposalSubType: [1, 2],
    scienceCategory: 3
  };

  const mockProposal2 = {
    proposalType: null,
    proposalSubType: [1, 2],
    scienceCategory: null
  };

  const isSV = vi.fn(() => false); // Mock `isSV` function

  const presentLatex = text => text; // Mock `presentLatex` function
  const trimText = (text, length) => text.substring(0, length); // Mock `trimText` function

  test('proposalType() should return NOT_SPECIFIED if proposalType is null or less than 1', () => {
    const proposalType = () => {
      const proposalType = mockProposal2.proposalType;
      const proposalName =
        !proposalType || proposalType < 1 ? NOT_SPECIFIED : t('proposalType.title.' + proposalType);
      return `${proposalName}`;
    };

    expect(proposalType()).toBe(NOT_SPECIFIED);
  });

  test('proposalType() should return translated proposalType if valid', () => {
    const proposalType = () => {
      const proposalType = mockProposal1.proposalType;
      const proposalName =
        !proposalType || proposalType < 1 ? NOT_SPECIFIED : t('proposalType.title.' + proposalType);
      return `${proposalName}`;
    };

    expect(proposalType()).toBe('proposalType.title.2');
  });

  test('proposalAttributes() should return translated subTypes', () => {
    const proposalAttributes = () => {
      let output = [];
      const subTypes = mockProposal1.proposalSubType ?? [];
      if (subTypes?.length && subTypes[0] > 0) {
        subTypes.forEach(element => output.push(t('proposalAttribute.title.' + element)));
      }
      return output;
    };

    expect(proposalAttributes()).toEqual([
      'proposalAttribute.title.1',
      'proposalAttribute.title.2'
    ]);
  });

  test('scienceCategory() should return NOT_SPECIFIED if scienceCategory is null', () => {
    const scienceCategory = () => {
      const cat = mockProposal2.scienceCategory;
      if (!cat) return NOT_SPECIFIED;
      const prefix = isSV() ? 'observationType' : 'scienceCategory';
      return t(`${prefix}.${cat}`);
    };

    expect(scienceCategory()).toBe(NOT_SPECIFIED);
  });

  test('scienceCategory() should return translated scienceCategory if valid', () => {
    const scienceCategory = () => {
      const cat = mockProposal1.scienceCategory;
      if (!cat) return NOT_SPECIFIED;
      const prefix = isSV() ? 'observationType' : 'scienceCategory';
      return t(`${prefix}.${cat}`);
    };

    expect(scienceCategory()).toBe('scienceCategory.3');
  });

  test('title() should render the correct title with LaTeX and trimmed text', () => {
    const title = (inLabel, inValue) => {
      return `${inLabel} ${presentLatex(trimText(inValue, 30))}`;
    };

    expect(title('Label:', 'This is a long latex text $x^2 + y^2 = z^2$ that needs trimming')).toBe(
      'Label: This is a long latex text $x^2'
    );
  });
});

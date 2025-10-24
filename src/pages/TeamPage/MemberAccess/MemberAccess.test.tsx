import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import React from 'react';
import MemberAccess from './MemberAccess';
import { PROPOSAL_ACCESS_SUBMIT, PROPOSAL_ACCESS_UPDATE } from '@/utils/aaa/aaaUtils';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const TestWrapper = () => {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([
    PROPOSAL_ACCESS_SUBMIT,
    PROPOSAL_ACCESS_UPDATE
  ]);

  return (
    <StoreProvider>
      <AppFlowProvider>
        <MemberAccess selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
      </AppFlowProvider>
    </StoreProvider>
  );
};

describe('<MemberAccess />', () => {
  test('renders correctly', () => {
    render(<TestWrapper />);
  });
});

// TODO - Add more tests for MemberAccess component

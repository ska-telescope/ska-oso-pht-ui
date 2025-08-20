import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import React from 'react';
import MemberAccess from './MemberAccess';

const TestWrapper = () => {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(['submit', 'update']);

  return (
    <StoreProvider>
      <MemberAccess selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
    </StoreProvider>
  );
};

describe('<MemberAccess />', () => {
  test('renders correctly', () => {
    render(<TestWrapper />);
  });
});

// TODO - Add more tests for MemberAccess component

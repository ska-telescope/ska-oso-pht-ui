import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFlowProvider, useAppFlow } from './AppFlowContext';

const TestComponent = () => {
  const { appFlow, isSV, setAppFlow } = useAppFlow();

  return (
    <div>
      <div data-testid="flow">{appFlow}</div>
      <div data-testid="isSV">{isSV() ? 'true' : 'false'}</div>
      <button onClick={() => setAppFlow('Proposal')}>Change Flow</button>
    </div>
  );
};

describe('AppFlowContext', () => {
  it('provides default value as "Science Verification"', () => {
    render(
      <AppFlowProvider>
        <TestComponent />
      </AppFlowProvider>
    );

    expect(screen.getByTestId('flow').textContent).toBe('Science Verification');
    expect(screen.getByTestId('isSV').textContent).toBe('true');
  });

  it('does not change value when setAppFlow is called (disabled)', () => {
    render(
      <AppFlowProvider>
        <TestComponent />
      </AppFlowProvider>
    );

    screen.getByText('Change Flow').click();

    expect(screen.getByTestId('flow').textContent).toBe('Science Verification');
    expect(screen.getByTestId('isSV').textContent).toBe('true');
  });
});

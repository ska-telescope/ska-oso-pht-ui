import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import SaveButton from './Save';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Save Button', () => {
  test('renders and calls the action on click', () => {
    const action = vi.fn();
    wrapper(<SaveButton action={action} />);
    const btn = screen.getByTestId('saveButtonTestId');
    expect(btn).toHaveTextContent('saveBtn.label');
    expect(btn.querySelector('svg')).toBeTruthy();
    btn.click();
    expect(action).toHaveBeenCalledOnce();
  });

  test('renders with an empty tooltip', () => {
    wrapper(<SaveButton action={vi.fn()} toolTip="" />);
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
  });

  test('respects disabled prop', () => {
    wrapper(<SaveButton action={vi.fn()} disabled />);
    expect(screen.getByTestId('saveButtonTestId')).toBeDisabled();
  });
});

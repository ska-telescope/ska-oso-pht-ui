import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DownloadButton from './Download';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Download Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<DownloadButton action={mockAction} />);
    expect(screen.getByTestId('downloadButtonTestId')).toHaveTextContent('downloadBtn.label');
    screen.getByTestId('downloadButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<DownloadButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('downloadButtonTestId')).toHaveTextContent('downloadBtn.label');
  });
});

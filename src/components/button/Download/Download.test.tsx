import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DownloadButton from './Download';
import '@testing-library/jest-dom';

describe('Download Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<DownloadButton action={mockAction} />);
    expect(screen.getByTestId('downloadButtonTestId')).toHaveTextContent('downloadBtn.label');
    screen.getByTestId('downloadButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<DownloadButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('downloadButtonTestId')).toHaveTextContent('downloadBtn.label');
  });
});

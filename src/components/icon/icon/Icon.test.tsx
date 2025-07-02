import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Icon from './Icon';

describe('<Icon />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <Icon onClick={mockAction} icon={<PictureAsPdfIcon />} testId={'testId'} toolTip={''} />
    );
    screen.getByTestId('testId').click();
    // expect(mockAction).toBeCalled();
  });
});

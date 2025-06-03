import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadIcon from './downloadIcon';

describe('<DownloadIcon />', () => {
  test('renders correctly', () => {
    render(<DownloadIcon onClick={vi.fn()} />);
  });
});

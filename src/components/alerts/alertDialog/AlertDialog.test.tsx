import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertDialog from './AlertDialog';

describe('<AlertDialog />', () => {
  test('renders correctly', () => {
    render(<AlertDialog open={false} onClose={vi.fn()} onDialogResponse={vi.fn()} />);
  });
});

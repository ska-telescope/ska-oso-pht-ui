import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpPanel from './HelpPanel';

describe('<HelpPanel />', () => {
  test('renders correctly', () => {
    render(<HelpPanel />);
  });
});

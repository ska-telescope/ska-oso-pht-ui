import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import StatusWrapper from './StatusWrapper';
import { STATUS_ERROR } from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<StatusWrapper />', () => {
  test('renders correctly ( default )', () => {
    wrapper(<StatusWrapper page={1} />);
  });
  test('renders correctly ( STATUS_ERROR  )', () => {
    wrapper(<StatusWrapper page={1} level={STATUS_ERROR} />);
  });
  test('renders correctly ( 7 )', () => {
    wrapper(<StatusWrapper page={1} level={7} />);
  });
});

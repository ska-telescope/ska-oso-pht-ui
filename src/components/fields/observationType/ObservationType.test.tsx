import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import ObservationType from './ObservationType';
import { TYPE_CONTINUUM } from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<ObservationType />', () => {
  test('renders correctly', () => {
    wrapper(<ObservationType value={TYPE_CONTINUUM} />);
  });
  test('renders correctly ( suffix )', () => {
    wrapper(<ObservationType suffix={'#'} value={TYPE_CONTINUUM} />);
  });
});

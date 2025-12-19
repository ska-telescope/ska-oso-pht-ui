import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageFooterPMT from './PageFooterPMT';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<PageFooterPMT />', () => {
  test('renders correctly', () => {
    wrapper(<PageFooterPMT pageNo={1} />);
  });
});

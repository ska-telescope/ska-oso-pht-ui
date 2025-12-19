import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ReferenceCoordinates from './ReferenceCoordinates';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<ReferenceCoordinates />', () => {
  test('renders correctly', () => {
    wrapper(<ReferenceCoordinates value={'0'} />);
  });
});

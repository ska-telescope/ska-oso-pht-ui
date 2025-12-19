import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ReferenceFrame from './ReferenceFrame';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    wrapper(<ReferenceFrame value={0} />);
  });
});

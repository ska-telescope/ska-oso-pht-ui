import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import SkyDirection1 from './SkyDirection1';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SkyDirection1 />', () => {
  test('renders correctly', () => {
    wrapper(<SkyDirection1 skyUnits={0} value={''} />);
  });
});

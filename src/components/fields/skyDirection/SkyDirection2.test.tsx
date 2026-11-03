import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import SkyDirection2 from './SkyDirection2';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SkyDirection2 />', () => {
  test('renders correctly', () => {
    wrapper(<SkyDirection2 skyUnits={0} value={''} />);
  });
});

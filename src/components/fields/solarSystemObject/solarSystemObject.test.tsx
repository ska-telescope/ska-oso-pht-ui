import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import SolarSystemObjectField from './solarSystemObject.tsx';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SolarSys />', () => {
  test('renders correctly', () => {
    wrapper(<SolarSystemObjectField value={'Mars'} />);
  });
});

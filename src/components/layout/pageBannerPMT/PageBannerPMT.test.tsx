import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import PageBannerPMT from './PageBannerPMT';

describe('<PageBannerPPT />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PageBannerPMT title={'title'} />
      </StoreProvider>
    );
  });
});

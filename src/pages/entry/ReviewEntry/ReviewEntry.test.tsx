import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { REVIEW_TYPE } from '@utils/constants.ts';
import { MemoryRouter } from 'react-router';
import ReviewEntry from './ReviewEntry';

describe('<ReviewEntry />', () => {
  test('renders correctly, Review type Science', () => {
    render(
      <MemoryRouter>
        <StoreProvider>
          <ReviewEntry reviewType={REVIEW_TYPE.SCIENCE} />
        </StoreProvider>
      </MemoryRouter>
    );
  });

  test('renders correctly, Review type Technical', () => {
    render(
      <MemoryRouter>
        <StoreProvider>
          <ReviewEntry reviewType={REVIEW_TYPE.TECHNICAL} />
        </StoreProvider>
      </MemoryRouter>
    );
  });
});

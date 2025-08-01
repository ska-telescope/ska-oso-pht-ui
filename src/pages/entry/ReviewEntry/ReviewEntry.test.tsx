import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ReviewEntry from './ReviewEntry';
import { REVIEW_TYPE } from '@utils/constants.ts';

describe('<ReviewEntry />', () => {
  test('renders correctly, Review type Science', () => {
    render(
      <StoreProvider>
        <ReviewEntry  reviewType={REVIEW_TYPE.SCIENCE}/>
      </StoreProvider>
    );
  });

  test('renders correctly, Review type Technical', () => {
    render(
      <StoreProvider>
        <ReviewEntry  reviewType={REVIEW_TYPE.TECHNICAL}/>
      </StoreProvider>
    );
  });
});

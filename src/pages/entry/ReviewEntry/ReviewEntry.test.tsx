import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { REVIEW_TYPE } from '@utils/constants.ts';
import { MemoryRouter } from 'react-router';
import ReviewEntry from './ReviewEntry';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <AppFlowProvider>{component}</AppFlowProvider>
      </StoreProvider>
    </MemoryRouter>
  );
};

describe('<ReviewEntry />', () => {
  test('renders correctly, Review type Science', () => {
    wrapper(<ReviewEntry reviewType={REVIEW_TYPE.SCIENCE} />);
  });

  test('renders correctly, Review type Technical', () => {
    wrapper(<ReviewEntry reviewType={REVIEW_TYPE.TECHNICAL} />);
  });
});

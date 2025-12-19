import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { REVIEW_TYPE } from '@utils/constants.ts';
import ReviewEntry from './ReviewEntry';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
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

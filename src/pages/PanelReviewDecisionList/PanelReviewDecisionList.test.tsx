import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ReviewDecisionListPage from './PanelReviewDecisionList';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<ReviewDecisionListPage />', () => {
  test('renders correctly', () => {
    wrapper(<ReviewDecisionListPage />);
  });
});

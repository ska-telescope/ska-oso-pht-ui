import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableReviewDecisionHeader from './TableObservationHeader';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe.skip('TableObservationHeader', () => {
  expect(true); // TODO: add/update test
});

// const wrapper = (component: React.ReactElement) => {
//   return render(
//     <StoreProvider>
//       <AppFlowProvider>{component}</AppFlowProvider>
//     </StoreProvider>
//   );
// };

// describe('ReviewDecisionTableHeader', () => {
//   it('renders all expected table headers', () => {
//     wrapper(<TableReviewDecisionHeader />);

//     expect(screen.getByText(/sciReviews/i)).toBeInTheDocument();
//     expect(screen.getByText(/title/i)).toBeInTheDocument();
//     expect(screen.getByText(/decisionStatus/i)).toBeInTheDocument();
//     expect(screen.getByText(/lastUpdated/i)).toBeInTheDocument();
//     expect(screen.getByText(/feasible/i)).toBeInTheDocument();
//     expect(screen.getByText(/decisionScore/i)).toBeInTheDocument();
//     expect(screen.getByText(/rank/i)).toBeInTheDocument();
//     expect(screen.getByText(/recommendation/i)).toBeInTheDocument();
//     expect(screen.getByText(/actions/i)).toBeInTheDocument();
//   });
// });

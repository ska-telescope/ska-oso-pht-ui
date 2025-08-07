import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { REVIEW_TYPE } from '@utils/constants.ts';
import { MemoryRouter } from 'react-router';
import ReviewEntry from './ReviewEntry';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockedUsedNavigate = vi.fn();

  return {
    ...actual,
    useLocation: () => ({
      state: {
        id: 'prsl-t0001-20250807-00001',
        proposal: {},
        sciReview: {
          comments: 'Gen comments 4',
          id: 'rvw-sci-DefaultUser-2025-08-07-00001-1411367',
          reviewerId: 'DefaultUser',
          reviewType: {
            excludedFromDecision: false,
            kind: 'Science Review',
            rank: 7
          },
          srcNet: 'SRC COMMENTS 2',
          status: 'Decided',
          submittedBy: 'DefaultUser',
          submittedOn: '2025-08-07T08:43:18.249000Z'
        },
        tecReview: {}
      }
    }),
    useNavigate: () => mockedUsedNavigate
  };
});

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

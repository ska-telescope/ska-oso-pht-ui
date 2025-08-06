import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { REVIEW_TYPE } from '@utils/constants.ts';
import ReviewEntry from './ReviewEntry';
import { addProposalPanel } from '@pages/PanelMaintenance/PanelMaintenance.tsx';
import MockProposalFrontendList from '@services/axios/getProposalList/mockProposalFrontendList.tsx';

describe('<ReviewEntry />', () => {
  test('renders correctly, Review type Science', () => {
    render(
      <StoreProvider>
        <ReviewEntry reviewType={REVIEW_TYPE.SCIENCE} />
      </StoreProvider>
    );
  });

  test('renders correctly, Review type Technical', () => {
    render(
      <StoreProvider>
        <ReviewEntry reviewType={REVIEW_TYPE.TECHNICAL} />
      </StoreProvider>
    );
  });
});

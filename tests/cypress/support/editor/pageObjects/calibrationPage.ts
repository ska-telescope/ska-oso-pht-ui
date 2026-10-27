// import { enter, section } from '../fields';
import type { PageObject } from '../types';

// TODO: Fill and verify the comment again once the Data Product page is reworked (BTN-3595). A
//  sensitivity result that arrives after leaving the Data Product page can wipe a comment typed
//  on this page in the meantime.
// The comment box has no label of its own, so find it by its section's heading
// const commentField = () => section('Comments on this strategy').findByRole('textbox');

// The calibration strategy is observatory defined, so the comment is the only thing to fill
export const calibrationPage: PageObject = {
  name: 'Calibration',
  heading: 'CALIBRATION',
  pageValidationError: 'The CALIBRATION STRATEGY page is not complete',
  fill: () => {
    // if (calibration.comment) {
    //   enter(commentField(), calibration.comment);
    // }
  },
  verify: ({ calibration }) => {
    cy.findByRole('textbox', { name: 'Starting Calibrator' }).should(
      'have.value',
      calibration.calibrator
    );
    // commentField().should('have.value', calibration.comment);
  }
};

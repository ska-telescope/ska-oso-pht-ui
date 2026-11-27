import { BACKEND_TIMEOUT } from '../editorActions';
import { enter, section } from '../fields';
import type { PageObject } from '../types';

// The comment box has no label of its own, so find it by its section's heading
const commentField = () => section('Comments on this strategy').findByRole('textbox');

// The calibration strategy is observatory defined, so the comment is the only thing to fill
export const calibrationPage: PageObject = {
  name: 'Calibration',
  heading: 'CALIBRATION',
  pageValidationError: 'The CALIBRATION STRATEGY page is not complete',
  fill: ({ calibration }) => {
    if (calibration.comment) {
      enter(commentField(), calibration.comment);
    }
  },
  verify: ({ calibration }) => {
    // The app gets the calibrator from oso-services, which can be slow under parallel CI load
    cy.findByRole('textbox', { name: 'Starting Calibrator', timeout: BACKEND_TIMEOUT }).should(
      'have.value',
      calibration.calibrator
    );
    commentField().should('have.value', calibration.comment);
  }
};

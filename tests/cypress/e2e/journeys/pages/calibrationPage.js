import { enter } from './fields';

// The comment field has no label
const commentField = () => cy.findByTestId('commentId').find('textarea:not([readonly])');

// The calibration strategy is observatory defined, so the comment is the only thing to fill
export const calibrationPage = {
  name: 'Calibration',
  heading: 'CALIBRATION',
  fill: ({ calibration }) => {
    if (calibration.comment) {
      enter(commentField(), calibration.comment);
    }
  },
  verify: ({ calibration }) => {
    cy.findByRole('textbox', { name: 'Starting Calibrator' }).should(
      'have.value',
      calibration.calibrator
    );
    commentField().should('have.value', calibration.comment);
  }
};

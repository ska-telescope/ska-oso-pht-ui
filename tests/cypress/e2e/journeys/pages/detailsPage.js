import { enter, select, verifySelected } from './fields';

// Labelled "Idea Summary" for SV
const abstractField = () => cy.findByRole('textbox', { name: 'Idea Summary' });

export const detailsPage = {
  name: 'Details',
  heading: 'DETAILS',
  fill: ({ details }) => {
    select('observationType', details.observingMode);
    enter(abstractField(), details.abstract);
  },
  verify: ({ details }) => {
    verifySelected('observationType', details.observingMode);
    abstractField().should('have.value', details.abstract);
  }
};

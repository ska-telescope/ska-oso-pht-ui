import { enter, select, verifySelected } from '../fields';
import type { PageObject } from '../types';

// Labelled "Idea Summary" for SV
const abstractField = () => cy.findByRole('textbox', { name: 'Idea Summary' });

export const detailsPage: PageObject = {
  name: 'Details',
  heading: 'DETAILS',
  fill: ({ details }) => {
    select('Observing Mode', details.observingMode);
    enter(abstractField(), details.abstract);
  },
  verify: ({ details }) => {
    verifySelected('Observing Mode', details.observingMode);
    abstractField().should('have.value', details.abstract);
  }
};

import { enter, section } from './fields';

// The integration time field has no label, and it's the only text field in its section
const integrationTimeField = () => section('Array Setup').findByRole('textbox');
const centralFrequencyField = () => cy.findByRole('spinbutton', { name: 'Central Frequency' });
const bandwidthField = () => cy.findByRole('spinbutton', { name: 'Bandwidth' });

export const observationPage = {
  name: 'Observation',
  heading: 'OBSERVATION',
  fill: ({ observation }) => {
    enter(integrationTimeField(), observation.integrationTime);
    enter(centralFrequencyField(), observation.centralFrequency);
    enter(bandwidthField(), observation.bandwidth);
  },
  verify: ({ observation }) => {
    integrationTimeField().should('have.value', observation.integrationTime);
    centralFrequencyField().should('have.value', observation.centralFrequency);
    bandwidthField().should('have.value', observation.bandwidth);
  }
};

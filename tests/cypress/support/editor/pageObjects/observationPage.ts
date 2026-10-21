import { enter, section, select, verifySelected } from '../fields';
import type { PageObject } from '../types';

// The integration time field has no label, and it's the only text field in its section
const integrationTimeField = () => section('Array Setup').findByRole('textbox');
const centralFrequencyField = () => cy.findByRole('spinbutton', { name: 'Central Frequency' });
const bandwidthField = () => cy.findByRole('spinbutton', { name: 'Bandwidth' });
const numberOfChannelsField = () => cy.findByRole('spinbutton', { name: 'Number of channels' });

// Spectral observations have no bandwidth to enter: it follows from the number of channels and
// the spectral resolution. The resolution options depend on the central frequency, so that is
// entered first, and the channels last.
export const observationPage: PageObject = {
  name: 'Observation',
  heading: 'OBSERVATION',
  fill: ({ observation }) => {
    enter(integrationTimeField(), observation.integrationTime);
    enter(centralFrequencyField(), observation.centralFrequency);
    if (observation.bandwidth) {
      enter(bandwidthField(), observation.bandwidth);
    }
    if (observation.spectralResolution) {
      select('spectralResolution', observation.spectralResolution);
    }
    if (observation.numberOfChannels) {
      enter(numberOfChannelsField(), observation.numberOfChannels);
    }
    if (observation.pstMode) {
      select('pstMode', observation.pstMode);
    }
  },
  verify: ({ observation }) => {
    integrationTimeField().should('have.value', observation.integrationTime);
    centralFrequencyField().should('have.value', observation.centralFrequency);
    if (observation.bandwidth) {
      bandwidthField().should('have.value', observation.bandwidth);
    }
    if (observation.spectralResolution) {
      verifySelected('spectralResolution', observation.spectralResolution);
    }
    if (observation.numberOfChannels) {
      numberOfChannelsField().should('have.value', observation.numberOfChannels);
    }
    if (observation.pstMode) {
      verifySelected('pstMode', observation.pstMode);
    }
  }
};

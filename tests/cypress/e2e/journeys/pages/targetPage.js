import { enter, select } from './fields';

export const targetPage = {
  name: 'Target',
  heading: 'TARGET',
  fill: ({ target }) => {
    select('referenceCoordinatesType', target.coordinateType);
    enter(cy.findByRole('textbox', { name: 'Name' }), target.name);
    enter(cy.findByRole('textbox', { name: 'Right Ascension' }), target.ra);
    enter(cy.findByRole('textbox', { name: 'Declination' }), target.dec);
    select('velocityType', target.velocityType);
    if (target.velocityType === 'Redshift') {
      enter(cy.findByRole('textbox', { name: 'Redshift' }), target.redshift);
    } else {
      select('velocityUnits', target.velocity.unit);
      enter(cy.findByRole('textbox', { name: 'Velocity' }), target.velocity.value);
    }
    cy.findByRole('button', { name: 'Add Target' }).click();
    // Adding the only target links it to the observation and runs the sensitivity calculator
    cy.findByText('Target added and auto-linked successfully.', { timeout: 30000 });
  },
  // The target list shows the one target
  verify: ({ target }) =>
    cy
      .findByRole('grid')
      .findByRole('row', { name: new RegExp(target.name) })
      .within(() => {
        cy.findByText(target.ra);
        cy.findByText(target.dec);
        if (target.velocityType === 'Redshift') {
          cy.findByText(target.redshift);
        }
      })
};

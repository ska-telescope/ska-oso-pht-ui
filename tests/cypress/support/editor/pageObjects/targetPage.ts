import { enter, section, select, selectUnit } from '../fields';
import type { PageObject } from '../types';

// Deletes the target with the given name from the target list, confirming the deletion
export const deleteTarget = (name: string) => {
  cy.findByRole('row', { name: new RegExp(name) })
    .findByRole('button', { name: 'Delete the target' })
    .click();
  cy.findByRole('dialog').findByRole('button', { name: 'Confirm' }).click();
};

export const targetPage: PageObject = {
  name: 'Target',
  heading: 'TARGET',
  fill: ({ target }) => {
    select('Coordinate Type', target.coordinateType);
    enter(cy.findByRole('textbox', { name: 'Name' }), target.name);
    cy.findByRole('button', { name: 'Resolve' }).click();
    // The resolver queries external services and can sometimes take a long time (usually on first query)
    cy.findByRole('textbox', { name: 'Right Ascension', timeout: 40000 }).should(
      'have.value',
      target.ra
    );
    cy.findByRole('textbox', { name: 'Declination' }).should('have.value', target.dec);
    // Resolving also fills in the velocity, which the fixture's values then replace. The velocity
    // type dropdown has no label, and it's the first dropdown in its section.
    section('Radial Motion').findAllByRole('combobox').first().click();
    cy.findByRole('option', { name: target.velocityType }).click();
    if (target.velocityType === 'Redshift') {
      enter(cy.findByRole('textbox', { name: 'Redshift' }), target.redshift);
    } else {
      selectUnit('Velocity', target.velocity.unit);
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

import { enter, section, select, selectUnit } from '../fields';
import type { PageObject, Target } from '../types';

// Deletes the target with the given name from the target list, confirming the deletion
export const deleteTarget = (name: string) => {
  cy.findByRole('row', { name: new RegExp(name) })
    .findByRole('button', { name: 'Delete the target' })
    .click();
  cy.findByRole('dialog').findByRole('button', { name: 'Confirm' }).click();
};

// Fills in the rest of the target after its coordinates, then adds it
const addTarget = (target: Target) => {
  // The velocity type dropdown has no label, and it's the first dropdown in its section
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
};

// Adds the target by looking up its coordinates by name. Only the Target page spec resolves,
// because the resolver depends on external services that are sometimes down.
export const addTargetByResolving = (target: Target) => {
  select('Coordinate Type', target.coordinateType);
  enter(cy.findByRole('textbox', { name: 'Name' }), target.name);
  cy.findByRole('button', { name: 'Resolve' }).click();
  // The resolver queries external services and can sometimes take a long time (usually on first query)
  cy.findByRole('textbox', { name: 'Right Ascension', timeout: 40000 }).should(
    'have.value',
    target.ra
  );
  cy.findByRole('textbox', { name: 'Declination' }).should('have.value', target.dec);
  // Resolving also fills in the velocity, which the fixture's values then replace
  addTarget(target);
};

export const targetPage: PageObject = {
  name: 'Target',
  heading: 'TARGET',
  pageValidationError: 'The TARGET page is not complete',
  // Types the coordinates in rather than resolving them, so the tests don't depend on the
  // resolver's external services
  fill: ({ target }) => {
    select('Coordinate Type', target.coordinateType);
    enter(cy.findByRole('textbox', { name: 'Name' }), target.name);
    enter(cy.findByRole('textbox', { name: 'Right Ascension' }), target.ra);
    enter(cy.findByRole('textbox', { name: 'Declination' }), target.dec);
    addTarget(target);
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

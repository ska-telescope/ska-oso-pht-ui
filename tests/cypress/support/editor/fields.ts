// Field helpers shared by the page objects.

// The bordered section with the given title, e.g. "Array Setup"
export const section = (title: string) =>
  cy
    .findByRole('heading', { name: title })
    .closest('[data-testid="borderedSection-label"]')
    .parent();

// Replaces a field's value and leaves the field, so the app stores it. Types over the selected
// value rather than clearing it, because number fields turn an empty value into 0.
export const enter = (field: Cypress.Chainable<JQuery>, value: string) =>
  field.type(`{selectall}${value}`).blur();

// TODO: Find by cy.findByRole('combobox', { name: label }) once the pages use the controlled
//  components. Current gui-components implementation of dropdowns does not wire the labels to
//  IDs correctly which is why we cannot do this yet.
const dropdown = (label: string) =>
  // cy.findByRole('combobox', { name: label })
  cy
    .contains('label', new RegExp(`^${label}`))
    .parent()
    .find('[role="combobox"]');

export const select = (label: string, option: string) => {
  dropdown(label).click();
  cy.findByRole('option', { name: option }).click();
};

export const verifySelected = (label: string, option: string) =>
  dropdown(label).should('have.text', option);

// A unit dropdown has no label of its own, so it's found from the value field it sits next to:
// the closest container of the field that also holds a dropdown
const unitDropdown = (valueField: Cypress.Chainable<JQuery>) =>
  valueField.parents(':has([role="combobox"])').first().find('[role="combobox"]');

export const selectUnit = (valueField: Cypress.Chainable<JQuery>, option: string) => {
  unitDropdown(valueField).click();
  cy.findByRole('option', { name: option }).click();
};

export const verifySelectedUnit = (valueField: Cypress.Chainable<JQuery>, option: string) =>
  unitDropdown(valueField).should('have.text', option);

const checkbox = (label: string) => {
  return cy.findByRole('checkbox', { name: label });
};

export const setChecked = (label: string, checked: boolean) =>
  checked ? checkbox(label).check() : checkbox(label).uncheck();

export const verifyChecked = (label: string, checked: boolean) =>
  checkbox(label).should(checked ? 'be.checked' : 'not.be.checked');

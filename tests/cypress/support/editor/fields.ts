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

// A unit dropdown has no label of its own, so it's found from the labelled value field it sits
// next to: the closest container of the field that also holds a dropdown
const unitDropdown = (label: string) =>
  cy
    .findByRole('textbox', { name: label })
    .parents(':has([role="combobox"])')
    .first()
    .find('[role="combobox"]');

export const selectUnit = (label: string, option: string) => {
  unitDropdown(label).click();
  cy.findByRole('option', { name: option }).click();
};

export const verifySelectedUnit = (label: string, option: string) =>
  unitDropdown(label).should('have.text', option);

// TODO: Find by cy.findByRole('checkbox', { name: label }) once the pages use the controlled
//  components. Current gui-components TickBox renders its label beside the checkbox without
//  wiring it up, so the checkbox has no accessible name.
const checkbox = (label: string) => {
  // cy.findByRole('checkbox', { name: label });
  const text = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return cy
    .contains('label', new RegExp(`^${text}( \\*)?$`))
    .parents(':has(input[type="checkbox"])')
    .first()
    .find('input[type="checkbox"]');
};

export const setChecked = (label: string, checked: boolean) =>
  checked ? checkbox(label).check() : checkbox(label).uncheck();

export const verifyChecked = (label: string, checked: boolean) =>
  checkbox(label).should(checked ? 'be.checked' : 'not.be.checked');

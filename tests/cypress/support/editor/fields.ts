// Field helpers shared by the page objects.

// The bordered section with the given title, e.g. "Array Setup"
export const section = (title: string) =>
  cy
    .findByRole('heading', { name: title })
    .closest('[data-testid="borderedSection-label"]')
    .parent();

// Replaces a field's value and leaves the field, so the app stores it.
// Cypress's typed input events have no inputType, which ska-gui-components' number fields read
// as a click on their arrows, so each key steps the value. Until the component tells them apart,
// the value is entered in one go, with the input event a browser sends for typing.
// TODO: Go back to typing once ControlledNumberField no longer steps on Cypress's input events (BTN-3671)
//  and replace the full content of the enter function just with this line:
//  field.type(`{selectall}${value}`).blur();
export const enter = (field: Cypress.Chainable<JQuery>, value: string) =>
  field
    .focus()
    .then(($input) => {
      const input = $input[0] as HTMLInputElement | HTMLTextAreaElement;
      // The app's own window, as events from the spec's window aren't the app's
      const win = input.ownerDocument.defaultView as Window & typeof globalThis;
      // React keeps track of the value it set, so the value is set past it for it to see a
      // change: through the setter of the element's own type, an input or a textarea
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set?.call(
        input,
        value
      );
      input.dispatchEvent(
        new win.InputEvent('input', { bubbles: true, inputType: 'insertText', data: value })
      );
    })
    .blur();

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

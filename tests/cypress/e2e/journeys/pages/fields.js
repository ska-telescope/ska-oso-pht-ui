// Field helpers shared by the page modules.
//
// Fields are found by role and accessible name where the app gives them one. The dropdowns,
// checkboxes and a few inputs have no accessible name, so those are found by their test ID
// instead.

// The bordered section with the given title, e.g. "Array Setup"
export const section = (title) =>
  cy
    .findByRole('heading', { name: title })
    .closest('[data-testid="borderedSection-label"]')
    .parent();

// Replaces a field's value and leaves the field, so the app stores it. Types over the selected
// value rather than clearing it, because number fields turn an empty value into 0.
export const enter = (field, value) => field.type(`{selectall}${value}`).blur();

const dropdown = (testId) => cy.findByTestId(testId).find('[role="combobox"]');

export const select = (testId, option) => {
  dropdown(testId).click();
  cy.findByRole('option', { name: option }).click();
};

export const verifySelected = (testId, option) => dropdown(testId).should('have.text', option);

const checkbox = (testId) => cy.findByTestId(testId).find('input[type="checkbox"]');

export const setChecked = (testId, checked) =>
  checked ? checkbox(testId).check() : checkbox(testId).uncheck();

export const verifyChecked = (testId, checked) =>
  checkbox(testId).should(checked ? 'be.checked' : 'not.be.checked');

import { visitWithAuth } from '../common/common';

// Each page module (see pages/) has a name, which is also the caption under the page's status
// indicator, its page heading, and fill() and verify() functions for the proposal fixture.

// Marks a step in the Cypress log, so a failure in a long journey shows which page it was on.
export const step = (name, body) => {
  cy.log(`**${name}**`);
  body();
};

// Stub out S3 document upload to not require local setup for description/technical/science document upload
export const stubDocumentUpload = () => {
  cy.intercept({ method: 'PUT', url: /X-Amz-Signature=/ }, { statusCode: 200 }).as(
    'documentUpload'
  );
};

const verifyOnLandingPage = () => cy.findByRole('button', { name: 'Submission' });

const verifyOnPage = (page) => cy.findByRole('heading', { name: page.heading });

// Creates a proposal in the given cycle with the fixture's title through the UI, and stores its
// ID as the '@proposalId' alias.
export const createProposal = (user, cycle, proposal) => {
  visitWithAuth(user);
  cy.findByRole('button', { name: 'Submission' }).click();
  cy.findByRole('dialog', { name: 'Cycle Selection' }).within(() => {
    cy.findByRole('button', { name: cycle.option, timeout: 20000 }).click();
    cy.findByRole('button', { name: 'Confirm' }).click();
  });
  cy.findByRole('textbox', { name: 'Title' }).type(proposal.title);
  cy.findByRole('button', { name: 'Create' }).click();
  // Waits on the real backend creating the proposal, so allow longer than the default
  cy.findByText(cycle.createdMessage, { timeout: 30000 });
  // The footer shows the new proposal's ID once it has been created
  cy.findByText(/^Submission ID: \S+/)
    .invoke('text')
    .then((text) => text.replace('Submission ID:', '').trim())
    .as('proposalId');
  verifyOnPage(cycle.pageAfterCreate);
};

// Every status indicator has the accessible name "Page Status", so pick the one whose caption
// is the page's name.
export const goToPage = (page) => {
  cy.findAllByRole('button', { name: 'Page Status' })
    // The caption starts with the status icon's text (e.g. "!" while the page has errors), so
    // match on how it ends
    .filter((_, button) => button.textContent.trim().endsWith(page.name))
    .click();
  verifyOnPage(page);
};

// Runs fill() for every page, in order.
export const fillPages = (pages, proposal) =>
  pages.forEach((page) =>
    step(`Fill ${page.name}`, () => {
      goToPage(page);
      page.fill(proposal);
    })
  );

// Runs verify() for every page, in order.
export const verifyPages = (pages, proposal, context) =>
  pages.forEach((page) =>
    step(`Verify ${page.name} (${context})`, () => {
      goToPage(page);
      page.verify(proposal);
    })
  );

// Goes back to the landing page and waits for the save that leaving the editor triggers.
export const saveAndExit = () => {
  // TODO: We have to intercept the call here to check for successful save as there is currently no
  //  indication to the user in the UI that a proposal has been saved when exiting proposal editor
  cy.intercept('PUT', '**/pht/prsls/*').as('saveOnExit');
  cy.findByRole('button', { name: 'Home' }).click();
  cy.wait('@saveOnExit').its('response.statusCode').should('eq', 200);
  verifyOnLandingPage();
};

// Reloads the app and reopens the proposal from the landing page, so everything shown
// afterwards comes from the backend rather than from the app's in-memory state.
export const reopenFromBackend = (cycle) => {
  cy.reload();
  verifyOnLandingPage();
  cy.get('@proposalId').then((id) => {
    cy.findByRole('textbox', { name: 'Search' }).type(id);
  });
  // Proposal IDs are unique, so exactly one proposal is left to edit. The button reads
  // "Edit proposal" or "Edit Science Verification Idea" depending on the landing page's cycle.
  cy.findByRole('button', { name: /^Edit / }).click();
  verifyOnPage(cycle.pageAfterOpen);
};

import type { PageObject } from '../types';

export const chooseDocument = (file: string | Cypress.FileReferenceObject) =>
  cy
    .findByTestId('fileUpload')
    .find('input[type="file"]')
    .selectFile(typeof file === 'string' ? `tests/cypress/fixtures/${file}` : file, {
      force: true
    });

// Uploading only asks the backend for a presigned URL; the upload to S3 itself is stubbed by
// stubDocumentUpload() in editorActions.js.
export const descriptionPage: PageObject = {
  name: 'Description',
  heading: 'DESCRIPTION',
  fill: ({ description }) => {
    chooseDocument(description.document);
    cy.findByRole('button', { name: 'Upload' }).click();
    cy.wait('@documentUpload');
  },
  // The page offers the uploaded PDF for download once the proposal has one
  verify: () => cy.findByRole('button', { name: 'Download' })
};

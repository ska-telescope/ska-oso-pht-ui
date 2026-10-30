import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import {
  createProposal,
  goToPage,
  stubDocumentUpload
} from '../../../support/editor/editorActions';
import {
  chooseDocument,
  descriptionPage
} from '../../../support/editor/pageObjects/descriptionPage';

const UPLOADED = 'Science Justification PDF successfully uploaded';
const UPLOAD_FAILED = 'It was unable to upload the Science Justification PDF';

describe('SV Description page', () => {
  const proposal = buildSvContinuumProposal();

  beforeEach(() => {
    stubDocumentUpload();
    createProposal(standardUser, SV_CYCLE, proposal);
    goToPage(descriptionPage);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('rejects a file that is not a PDF', () => {
    chooseDocument({
      contents: Cypress.Buffer.from('Not a PDF'),
      fileName: 'notes.txt',
      mimeType: 'text/plain'
    });

    cy.findByText('Unable to read the selected file. Please ensure it is a valid PDF.');
    cy.findByRole('button', { name: 'Download' }).should('not.exist');
  });

  it('rejects a PDF with more than the maximum number of pages', () => {
    chooseDocument('fivePageFile.pdf');

    cy.findByText('Exceeded maximum page count: 5 / 4 pages');
    // The rejected file is cleared, so there's nothing to upload
    cy.findByRole('button', { name: 'Upload' }).should('not.exist');
  });

  it('shows an error and keeps no document when the upload URL cannot be fetched', () => {
    cy.intercept('POST', '**/signed-url/upload/*', { statusCode: 500 });

    chooseDocument(proposal.description.document);
    cy.findByRole('button', { name: 'Upload' }).click();

    cy.findByText(UPLOAD_FAILED);
    cy.findByRole('button', { name: 'Download' }).should('not.exist');
  });

  it('shows an error and keeps no document when the upload to S3 fails', () => {
    // Takes precedence over the stub from stubDocumentUpload(), as it's added later
    cy.intercept({ method: 'PUT', url: /X-Amz-Signature=/ }, { statusCode: 500 });

    chooseDocument(proposal.description.document);
    cy.findByRole('button', { name: 'Upload' }).click();

    cy.findByText(UPLOAD_FAILED);
    cy.findByRole('button', { name: 'Download' }).should('not.exist');
  });

  it('blocks replacing an uploaded document until it is deleted, then accepts a new one', () => {
    // Like the upload, deleting goes straight to S3 through a presigned URL
    cy.intercept({ method: 'DELETE', url: /X-Amz-Signature=/ }, { statusCode: 204 }).as(
      'documentDelete'
    );

    descriptionPage.fill(proposal);
    cy.findByText(UPLOADED);
    // Choosing another file would normally offer to upload it
    chooseDocument(proposal.description.document);
    cy.findByRole('button', { name: 'Upload' }).should('not.exist');

    cy.findByRole('button', { name: 'Delete' }).click();
    cy.wait('@documentDelete');
    cy.findByText('Science Justification PDF successfully deleted');

    // Uploading finds and clicks the upload button, so it's available again
    descriptionPage.fill(proposal);
    descriptionPage.verify(proposal);
  });
});

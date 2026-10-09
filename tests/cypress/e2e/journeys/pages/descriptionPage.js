// Uploading only asks the backend for a presigned URL; the upload to S3 itself is stubbed by
// stubDocumentUpload() in editorActions.js.
export const descriptionPage = {
  name: 'Description',
  heading: 'DESCRIPTION',
  fill: ({ description }) => {
    cy.findByTestId('fileUpload')
      .find('input[type="file"]')
      .selectFile(`tests/cypress/fixtures/${description.document}`, { force: true });
    cy.findByRole('button', { name: 'Upload' }).click();
    cy.wait('@documentUpload');
  },
  // The page offers the uploaded PDF for download once the proposal has one
  verify: () => cy.findByRole('button', { name: 'Download' })
};

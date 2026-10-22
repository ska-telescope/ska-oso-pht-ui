describe('SV Description page', () => {
  it('rejects a file that is not a PDF');

  it('rejects a PDF with more than the maximum number of pages');

  it('shows an error and keeps no document when the upload URL cannot be fetched');

  it('shows an error and keeps no document when the upload to S3 fails');

  it('blocks replacing an uploaded document until it is deleted, then accepts a new one');
});

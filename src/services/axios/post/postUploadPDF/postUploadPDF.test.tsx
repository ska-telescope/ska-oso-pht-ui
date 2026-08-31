import { describe, expect, test } from 'vitest';
import PostUploadPDF from '@services/axios/post/postUploadPDF/postUploadPDF.tsx';

describe('PostUploadPDF Service', () => {
  test('returns data from API', async () => {
    const result = PostUploadPDF();
    expect(result).to.include('/prsls/signed-url/upload');
  });
});

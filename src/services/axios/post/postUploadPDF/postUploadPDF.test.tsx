import { describe, expect, test } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import PostUploadPDF from '@services/axios/post/postUploadPDF/postUploadPDF.tsx';

describe('PostUploadPDF Service', () => {
  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = PostUploadPDF();
    expect(result).to.deep.equal('https://httpbin.org/post');
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    const result = PostUploadPDF();
    expect(result).to.include('/prsls/signed-url/upload');
  });
});

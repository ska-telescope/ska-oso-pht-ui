import postSendEmailInvite from '@services/axios/post/postSendEmailInvite/postSendEmailInvite.tsx';
import { MockEmailInvite } from '@services/axios/post/postSendEmailInvite/mockEmailInvite.tsx';
import { expect, test } from 'vitest';

describe('PostSendEmailInvite Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      post: vi.fn()
    };
  });

  test('returns confirmation when data valid', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: { valid: 'Email sent successfully' } });
    const result = await postSendEmailInvite(mockedAuthClient, MockEmailInvite);
    expect(result).to.toStrictEqual({ valid: 'Email sent successfully' });
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await postSendEmailInvite(mockedAuthClient, MockEmailInvite);
    expect(result).to.deep.equal({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await postSendEmailInvite(mockedAuthClient, MockEmailInvite);
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });
});

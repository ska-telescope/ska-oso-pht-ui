import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { GetMockUserByEmail, mapping } from './getUserByEmail';
import { MockUserFrontendList } from './mockUserFrontend';
import { MockUserBackendList } from './mockUserBackend';

describe('Helper Functions', () => {
  test('GetMockUserByEmail returns mock user', () => {
    const result = GetMockUserByEmail(MockUserBackendList[0].email);
    expect(result).to.deep.equal(MockUserFrontendList[0]);
    const result2 = GetMockUserByEmail(MockUserBackendList[1].email);
    expect(result2).to.deep.equal(MockUserFrontendList[1]);
  });

  test('GetMockUserByEmail returns correct mock user when case not matching', () => {
    const result = GetMockUserByEmail('sarah.SATTAR@community.skao.int');
    expect(result).to.deep.equal(MockUserFrontendList[0]);
  });

  test('GetMockUserByEmail returns error when user not in stargazer mocked list', () => {
    const result = GetMockUserByEmail('someone.else@community.skao.int');
    expect(result).to.equal('error.API_UNKNOWN_ERROR');
  });

  test('mapping user list returns mapped users from backend to frontend format', () => {
    const userBackendList = MockUserBackendList;
    const userFrontendList = userBackendList.map(mapping);
    expect(userFrontendList).to.deep.equal(MockUserFrontendList);
  });
});

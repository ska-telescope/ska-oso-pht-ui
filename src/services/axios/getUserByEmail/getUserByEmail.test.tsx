import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { GetMockUserByEmail, mapping } from './getUserByEmail';
import { MockUserFrontendPartial, MockUserFrontendComplete } from './mockUserFrontend';
import { MockUserBackendPartial, MockUserBackendComplete } from './mockUserBackend';

describe('Helper Functions', () => {
  test('GetMockUserByEmail returns mock user', () => {
    const result = GetMockUserByEmail();
    expect(result).to.deep.equal(MockUserFrontendPartial);
  });

  test('mapping uncomplete profile user returns mapped user from backend to frontend format', () => {
    const userFrontEnd = mapping(MockUserBackendPartial);
    expect(userFrontEnd).to.deep.equal(MockUserFrontendPartial);
  });

  test('mapping returns mapped user from backend to frontend format', () => {
    const userFrontEnd = mapping(MockUserBackendComplete);
    expect(userFrontEnd).to.deep.equal(MockUserFrontendComplete);
  });
});

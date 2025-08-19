import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import MockProposalAccessBackend from './mockProposalAccessBackend';
import MockProposalAccessFrontend from './mockProposalAccessFrontend';
import { mappingList } from './mappingList';
import ProposalAccess from '@/utils/types/proposalAccess';

describe('mappingList', () => {
  test('mappingList returns mapped proposal access from backend to frontend format', () => {
    const proposalFrontEnd: ProposalAccess[] = mappingList(MockProposalAccessBackend);
    expect(proposalFrontEnd).to.deep.equal(MockProposalAccessFrontend);
  });
});

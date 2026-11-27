import { describe, expect, test } from 'vitest';
import { proposalAccessFromPdm, proposalAccessToPdm } from './proposalAccess';
import MockProposalAccessBackend from './mockProposalAccessBackend';
import MockProposalAccessFrontend from './mockProposalAccessFrontend';
import type { ProposalAccess as ProposalAccessPDM } from '@/generated/models';

const pdms = MockProposalAccessBackend as ProposalAccessPDM[];

describe('proposalAccessFromPdm', () => {
  test("maps the ODA's access to the app's", () => {
    expect(pdms.map(proposalAccessFromPdm)).toEqual(MockProposalAccessFrontend);
  });
});

describe('proposalAccessToPdm', () => {
  test("maps the app's access to the ODA's", () => {
    expect(MockProposalAccessFrontend.map(proposalAccessToPdm)).toEqual(pdms);
  });
});

import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { OSO_SERVICES_PROPOSAL_PATH, PROPOSAL_STATUS, PROPOSAL_TYPE } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { ProposalType } from './proposal';
import { useProposalOda } from './useProposalOda';
import { getDetailsSchema } from './details';
import phtTranslations from '../../../public/locales/en/pht.json';
import { InvestigatorBackend } from '@/utils/types/investigator';
import { getProposalFormValues } from './useProposalForm';

const { mockGet, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn()
}));
vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: { get: mockGet, put: mockPut } })
}));

const pdm = MockProposalBackend as ProposalBackend;
const investigator = MockUserFrontendList[0];

const renderWithForm = (title = '', proposalType = PROPOSAL_TYPE.KEY_SCIENCE) => {
  const { result: form } = renderHook(() =>
    useForm<ProposalType>({
      // The other slices match the proposal being saved, as they do when seeded from the store
      defaultValues: { ...getProposalFormValues(mapping(pdm)), title, proposalType }
    })
  );
  const { result: oda } = renderHook(() => useProposalOda(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <FormProvider {...form.current}>{children}</FormProvider>
    )
  });
  return { form, oda };
};

describe('useProposalOda', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPut.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Load from ODA maps the PDM into the form and returns the legacy proposal', async () => {
    mockGet.mockResolvedValue({ data: pdm });
    const { form, oda } = renderWithForm();

    let loaded;
    await act(async () => {
      loaded = await oda.current.loadFromOda('prsl-1');
    });

    expect(form.current.getValues('title')).toBe(pdm.proposal_info.title);
    expect(form.current.getValues('proposalType')).toBe(pdm.proposal_info.proposal_type.main_type);
    expect(form.current.getValues()).not.toHaveProperty('observingMode');
    expect(form.current.getValues('abstract')).toBe(pdm.proposal_info.abstract);
    expect(form.current.getValues('scienceCategory')).toBe(1);
    expect(form.current.getValues('investigators')).toEqual([]);
    expect(loaded).toEqual(mapping(pdm));
  });

  test('Load from ODA returns the error and leaves the form alone on failure', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));
    const { form, oda } = renderWithForm('Unsaved title');

    let loaded;
    await act(async () => {
      loaded = await oda.current.loadFromOda('prsl-1');
    });

    expect(loaded).toBe('Network Error');
    expect(form.current.getValues('title')).toBe('Unsaved title');
  });

  test('Load from ODA returns mapping errors without resetting form values or errors', async () => {
    const malformed = {
      ...pdm,
      observation_info: {
        ...pdm.observation_info,
        targets: pdm.observation_info?.targets?.map((target) => ({
          ...target,
          radial_velocity: undefined
        }))
      }
    };
    expect(() => mapping(malformed)).toThrow();
    mockGet.mockResolvedValue({ data: malformed });
    const { form, oda } = renderWithForm('Unsaved title');
    act(() => {
      form.current.setError('title', { type: 'manual', message: 'Existing error' });
    });

    let loaded;
    await act(async () => {
      loaded = await oda.current.loadFromOda('prsl-1');
    });

    expect(loaded).toEqual(expect.any(String));
    expect(loaded).not.toBe('');
    expect(form.current.getValues('title')).toBe('Unsaved title');
    expect(form.current.getFieldState('title').error?.message).toBe('Existing error');
  });

  test('Load from ODA returns the standard error for non-Error mapping failures', async () => {
    mockGet.mockResolvedValue({
      data: {
        ...pdm,
        get observation_info() {
          throw 'Mapping failed';
        }
      }
    });
    const { form, oda } = renderWithForm('Unsaved title');

    await expect(oda.current.loadFromOda('prsl-1')).resolves.toBe('error.API_UNKNOWN_ERROR');
    expect(form.current.getValues('title')).toBe('Unsaved title');
  });

  test('Save to ODA sends the RHF title and type with the legacy proposal in one request', async () => {
    mockPut.mockResolvedValue({ data: pdm });
    const { oda } = renderWithForm('Edited title');
    const legacy = mapping(pdm);

    const saved = await oda.current.saveToOda(legacy);

    const expected = MappingPutProposal(legacy, PROPOSAL_STATUS.DRAFT);
    expect(mockPut).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(`${OSO_SERVICES_PROPOSAL_PATH}/${legacy.id}`),
      {
        ...expected,
        proposal_info: {
          ...expected.proposal_info,
          title: 'Edited title',
          abstract: pdm.proposal_info.abstract,
          science_category: pdm.proposal_info.science_category,
          investigators: [],
          proposal_type: {
            ...expected.proposal_info.proposal_type,
            main_type: PROPOSAL_TYPE.KEY_SCIENCE
          }
        }
      }
    );
    expect(saved).toEqual(pdm);
  });

  test('Save to ODA preserves legacy saves outside the proposal form', async () => {
    mockPut.mockResolvedValue({ data: pdm });
    const { result } = renderHook(() => useProposalOda());
    const legacy = mapping(pdm);
    expect(await result.current.saveToOda(legacy)).toEqual(pdm);
    expect(mockPut).toHaveBeenCalledWith(
      expect.any(String),
      MappingPutProposal(legacy, PROPOSAL_STATUS.DRAFT)
    );
  });

  test.each([0, Number(phtTranslations.abstract.maxWord) + 1])(
    'saves a %s-word abstract as a draft and still saves subsequent edits',
    async (wordCount) => {
      const abstract = Array(wordCount).fill('a').join(' ');
      expect(abstract.length).toBeLessThan(Number(phtTranslations.abstract.maxChar));
      mockPut.mockResolvedValue({ data: pdm });
      const { form, oda } = renderWithForm('Draft title');
      const legacy = mapping(pdm);
      act(() => {
        form.current.setValue('abstract', abstract);
      });

      expect(getDetailsSchema().safeParse(form.current.getValues()).success).toBe(false);
      await expect(oda.current.saveToOda(legacy)).resolves.toEqual(pdm);
      expect(mockPut).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: PROPOSAL_STATUS.DRAFT,
          proposal_info: expect.objectContaining({ abstract })
        })
      );

      act(() => {
        form.current.setValue('title', 'Edited on another page');
      });
      await expect(oda.current.saveToOda(legacy)).resolves.toEqual(pdm);
      expect(mockPut).toHaveBeenCalledTimes(2);
      expect(mockPut).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          proposal_info: expect.objectContaining({ abstract, title: 'Edited on another page' })
        })
      );
    }
  );

  test.each([undefined, null, '', 'Analytical Engines'])(
    'saves edited details when an investigator organization is %s',
    async (organization) => {
      const proposalId = 'prsl-1';
      const withInvestigator: ProposalBackend = {
        ...pdm,
        prsl_id: proposalId,
        proposal_info: {
          ...pdm.proposal_info,
          investigators: [
            {
              user_id: investigator.id,
              given_name: investigator.firstName,
              family_name: investigator.lastName,
              email: investigator.email,
              organization,
              for_phd: investigator.phdThesis,
              principal_investigator: investigator.pi,
              status: investigator.status
            }
          ]
        }
      };
      mockGet.mockResolvedValue({ data: withInvestigator });
      mockPut.mockResolvedValue({ data: withInvestigator });
      const { form, oda } = renderWithForm();

      await act(async () => {
        await oda.current.loadFromOda(proposalId);
      });
      act(() => {
        form.current.setValue('abstract', 'Edited details');
      });

      expect(form.current.getValues('investigators')?.[0]).not.toHaveProperty('affiliation');
      await expect(oda.current.saveToOda(mapping(withInvestigator))).resolves.toEqual(
        withInvestigator
      );
      expect(mockPut).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining(`${OSO_SERVICES_PROPOSAL_PATH}/${withInvestigator.prsl_id}`),
        expect.objectContaining({
          investigator_refs: [investigator.id],
          proposal_info: expect.objectContaining({
            abstract: 'Edited details',
            investigators: [
              expect.objectContaining({
                user_id: investigator.id,
                organization: organization ?? ''
              })
            ]
          })
        })
      );
    }
  );

  test.each([undefined, null])(
    'saves edits outside Team when investigator names and email are %s and flags are omitted',
    async (value) => {
      const proposalId = 'prsl-1';
      const withInvestigator: ProposalBackend = {
        ...pdm,
        prsl_id: proposalId,
        proposal_info: {
          ...pdm.proposal_info,
          investigators: [
            {
              user_id: investigator.id,
              status: investigator.status,
              given_name: value,
              family_name: value,
              email: value
            }
          ]
        }
      };
      mockGet.mockResolvedValue({ data: withInvestigator });
      mockPut.mockResolvedValue({ data: withInvestigator });
      const { form, oda } = renderWithForm();

      await act(async () => {
        await oda.current.loadFromOda(proposalId);
      });
      const expectedInvestigator = {
        id: investigator.id,
        status: investigator.status,
        firstName: '',
        lastName: '',
        email: '',
        affiliation: '',
        phdThesis: false,
        pi: false,
        officeLocation: null,
        jobTitle: null
      };
      expect(mapping(withInvestigator).investigators).toEqual([expectedInvestigator]);
      expect(form.current.getValues('investigators')).toEqual([
        {
          id: investigator.id,
          status: investigator.status,
          firstName: '',
          lastName: '',
          email: '',
          phdThesis: false,
          pi: false
        }
      ]);
      act(() => {
        form.current.setValue('abstract', 'Edited details');
        form.current.setValue('title', 'Edited title');
      });

      await expect(oda.current.saveToOda(mapping(withInvestigator))).resolves.toEqual(
        withInvestigator
      );
      expect(mockPut).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining(`${OSO_SERVICES_PROPOSAL_PATH}/${proposalId}`),
        expect.objectContaining({
          investigator_refs: [investigator.id],
          proposal_info: expect.objectContaining({
            title: 'Edited title',
            abstract: 'Edited details',
            investigators: [
              {
                user_id: investigator.id,
                status: investigator.status,
                given_name: '',
                family_name: '',
                email: '',
                organization: '',
                for_phd: false,
                principal_investigator: false,
                officeLocation: null,
                jobTitle: null
              }
            ]
          })
        })
      );
    }
  );

  test('preserves existing metadata when saving team additions, edits, and removals', async () => {
    const existing: InvestigatorBackend = {
      user_id: investigator.id,
      given_name: investigator.firstName,
      family_name: investigator.lastName,
      email: investigator.email,
      status: investigator.status,
      organization: 'Existing institute',
      officeLocation: 'Existing office',
      jobTitle: 'Existing job',
      for_phd: false,
      principal_investigator: true
    };
    const withTeam: ProposalBackend = {
      ...pdm,
      proposal_info: {
        ...pdm.proposal_info,
        investigators: [existing, { ...existing, user_id: 'removed' }]
      }
    };
    mockGet.mockResolvedValue({ data: withTeam });
    mockPut.mockResolvedValue({ data: withTeam });
    const { form, oda } = renderWithForm();
    let loaded = mapping(withTeam);
    await act(async () => {
      const result = await oda.current.loadFromOda('prsl-1');
      if (typeof result === 'string') throw new Error(result);
      loaded = result;
    });
    const [member] = form.current.getValues('investigators') ?? [];
    act(() => {
      form.current.setValue('investigators', [
        { ...member, id: 'new-member', pi: false },
        { ...member, firstName: 'Edited name' }
      ]);
    });

    await oda.current.saveToOda(loaded);

    expect(mockPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        investigator_refs: ['new-member', investigator.id],
        proposal_info: expect.objectContaining({
          investigators: [
            expect.objectContaining({
              user_id: 'new-member',
              organization: '',
              officeLocation: null,
              jobTitle: null
            }),
            expect.objectContaining({
              user_id: investigator.id,
              given_name: 'Edited name',
              organization: 'Existing institute',
              officeLocation: 'Existing office',
              jobTitle: 'Existing job'
            })
          ]
        })
      })
    );
    expect(form.current.getValues('investigators')?.[0]).not.toHaveProperty('affiliation');
  });

  test('Save to ODA returns API errors', async () => {
    mockPut.mockRejectedValue(new Error('Save failed'));
    const { oda } = renderWithForm('Edited title');

    expect(await oda.current.saveToOda(mapping(pdm))).toEqual({ error: 'Save failed' });
  });
});

import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { PROPOSAL_STATUS, PROPOSAL_TYPE, SENSITIVITY_STATE } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { ProposalType } from './proposal';
import { DATA_PRODUCT_KIND } from './dataProducts';
import { useProposalOda } from './useProposalOda';
import { getDetailsSchema } from './details';
import phtTranslations from '../../../public/locales/en/pht.json';
import { InvestigatorBackend } from '@/utils/types/investigator';
import { getProposalFormValues } from './useProposalForm';

const { mockGet, mockPut, mockCreate, mockRefreshAuthToken } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn(),
  mockCreate: vi.fn(),
  mockRefreshAuthToken: vi.fn()
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/axios/axiosAuthClient/axiosAuthClient')>()),
  useRefreshAuthToken: () => mockRefreshAuthToken
}));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    getProposalOsoApiV17PhtPrslsPrslIdGet: mockGet,
    updateProposalOsoApiV17PhtPrslsPrslIdPut: mockPut,
    createProposalOsoApiV17PhtPrslsCreatePost: mockCreate
  })
}));

const pdm = MockProposalBackend as ProposalBackend;
const investigator = MockUserFrontendList[0];

const renderWithForm = (title = '', proposalType = PROPOSAL_TYPE.KEY_SCIENCE) => {
  const { result: form } = renderHook(() =>
    useForm<ProposalType>({
      // The other slices match the proposal being saved, as they do when seeded from the store
      defaultValues: {
        ...getProposalFormValues(mapping(pdm)),
        title,
        proposalType: { type: proposalType, subTypes: [] }
      }
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
    mockCreate.mockReset();
    mockRefreshAuthToken.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Load from ODA maps the PDM into the form and returns the form values', async () => {
    mockGet.mockResolvedValue({ data: pdm });
    const { form, oda } = renderWithForm();

    let loaded;
    await act(async () => {
      loaded = await oda.current.loadFromOda('prsl-1');
    });

    expect(form.current.getValues('title')).toBe(pdm.proposal_info.title);
    expect(form.current.getValues('proposalType')).toEqual({
      type: pdm.proposal_info.proposal_type.main_type,
      subTypes: pdm.proposal_info.proposal_type.attributes
    });
    expect(form.current.getValues()).not.toHaveProperty('observingMode');
    expect(form.current.getValues('abstract')).toBe(pdm.proposal_info.abstract);
    expect(form.current.getValues('scienceCategory')).toBe(1);
    expect(form.current.getValues('investigators')).toEqual([]);
    expect(mockGet).toHaveBeenCalledExactlyOnceWith('prsl-1');
    expect(loaded).toEqual({ data: mapPdmToForm(pdm) });
  });

  test('Load from ODA links an SV target saved without its link to new default data products', async () => {
    // Saved when the main data product was invalid, so it and its link were left out
    mockGet.mockResolvedValue({
      data: {
        ...pdm,
        proposal_info: {
          ...pdm.proposal_info,
          proposal_type: { main_type: PROPOSAL_TYPE.SCIENCE_VERIFICATION }
        },
        observation_info: { ...pdm.observation_info, data_product_sdps: [], result_details: [] }
      }
    });
    const { form, oda } = renderWithForm();

    await act(async () => {
      await oda.current.loadFromOda('prsl-1');
    });

    const [observation] = mapping(pdm).observations ?? [];
    const dataProducts = form.current.getValues('dataProducts');
    expect(dataProducts.map((dp) => [dp.observationId, dp.kind])).toEqual([
      [observation.id, DATA_PRODUCT_KIND.CONTINUUM_IMAGE],
      [observation.id, DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES]
    ]);
    expect(form.current.getValues('targetObservation')).toEqual([
      {
        targetId: form.current.getValues('targets')[0].id,
        observationId: observation.id,
        dataProductsSDPId: dataProducts[0].id,
        sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
      }
    ]);
  });

  test('Load from ODA returns the error and leaves the form alone on failure', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));
    const { form, oda } = renderWithForm('Unsaved title');

    let loaded;
    await act(async () => {
      loaded = await oda.current.loadFromOda('prsl-1');
    });

    expect(loaded).toEqual({ error: 'Network Error' });
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

    expect(loaded).toEqual({ error: expect.any(String) });
    expect(loaded).not.toEqual({ error: '' });
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

    await expect(oda.current.loadFromOda('prsl-1')).resolves.toEqual({
      error: 'error.API_UNKNOWN_ERROR'
    });
    expect(form.current.getValues('title')).toBe('Unsaved title');
  });

  test('Save to ODA sends the whole proposal from the form in one request', async () => {
    mockPut.mockResolvedValue({ data: pdm });
    const { form, oda } = renderWithForm('Edited title');

    const saved = await oda.current.saveToOda();

    expect(mockPut).toHaveBeenCalledExactlyOnceWith(pdm.prsl_id, {
      ...mapFormToPdm(form.current.getValues()),
      status: PROPOSAL_STATUS.DRAFT,
      submitted_on: null,
      submitted_by: ''
    });
    expect(mockPut.mock.calls[0][1].proposal_info).toMatchObject({
      title: 'Edited title',
      // The type and its sub-types are the form's
      proposal_type: { main_type: PROPOSAL_TYPE.KEY_SCIENCE, attributes: [] }
    });
    expect(saved).toEqual({ data: pdm });
  });

  test('Save to ODA saves nothing without the proposal form', async () => {
    const { result } = renderHook(() => useProposalOda());
    expect(await result.current.saveToOda()).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  test.each([0, Number(phtTranslations.abstract.maxWord) + 1])(
    'saves a %s-word abstract as a draft and still saves subsequent edits',
    async (wordCount) => {
      const abstract = Array(wordCount).fill('a').join(' ');
      expect(abstract.length).toBeLessThan(Number(phtTranslations.abstract.maxChar));
      mockPut.mockResolvedValue({ data: pdm });
      const { form, oda } = renderWithForm('Draft title');
      act(() => {
        form.current.setValue('abstract', abstract);
      });

      expect(getDetailsSchema().safeParse(form.current.getValues()).success).toBe(false);
      await expect(oda.current.saveToOda()).resolves.toEqual({ data: pdm });
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
      await expect(oda.current.saveToOda()).resolves.toEqual({ data: pdm });
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
      await expect(oda.current.saveToOda()).resolves.toEqual({
        data: withInvestigator
      });
      expect(mockPut).toHaveBeenCalledExactlyOnceWith(
        withInvestigator.prsl_id,
        expect.objectContaining({
          proposal_info: expect.objectContaining({
            abstract: 'Edited details',
            investigators: [
              expect.objectContaining({
                user_id: investigator.id
              })
            ]
          })
        })
      );
      expect(mockPut.mock.calls[0][1].proposal_info.investigators[0]).not.toHaveProperty(
        'organization'
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
        phdThesis: false,
        pi: false
      };
      expect(mapping(withInvestigator).investigators).toEqual([expectedInvestigator]);
      expect(form.current.getValues('investigators')).toEqual([
        {
          id: investigator.id,
          status: investigator.status,
          phdThesis: false,
          pi: false
        }
      ]);
      act(() => {
        form.current.setValue('abstract', 'Edited details');
        form.current.setValue('title', 'Edited title');
      });

      await expect(oda.current.saveToOda()).resolves.toEqual({
        data: withInvestigator
      });
      expect(mockPut).toHaveBeenCalledExactlyOnceWith(
        proposalId,
        expect.objectContaining({
          proposal_info: expect.objectContaining({
            title: 'Edited title',
            abstract: 'Edited details',
            investigators: [
              {
                user_id: investigator.id,
                status: investigator.status,
                for_phd: false,
                principal_investigator: false
              }
            ]
          })
        })
      );
    }
  );

  test('saves current team additions, edits, and removals without unused metadata', async () => {
    const existing: InvestigatorBackend = {
      user_id: investigator.id,
      given_name: investigator.firstName,
      family_name: investigator.lastName,
      email: investigator.email,
      status: investigator.status,
      organization: 'Existing institute',
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
    await act(async () => {
      const result = await oda.current.loadFromOda('prsl-1');
      if (result.error) throw new Error(result.error);
    });
    const [member] = form.current.getValues('investigators') ?? [];
    act(() => {
      form.current.setValue('investigators', [
        { ...member, id: 'new-member', pi: false },
        { ...member, firstName: 'Edited name' }
      ]);
    });

    await oda.current.saveToOda();

    expect(mockPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        proposal_info: expect.objectContaining({
          investigators: [
            expect.objectContaining({
              user_id: 'new-member'
            }),
            expect.objectContaining({
              user_id: investigator.id,
              given_name: 'Edited name'
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

    expect(await oda.current.saveToOda()).toEqual({ error: 'Save failed' });
  });
  describe('Create in ODA', () => {
    // The backend adds the caller as PI and returns the proposal as stored
    const backendPi: InvestigatorBackend = {
      user_id: 'signed-in-user',
      given_name: 'Real',
      family_name: 'Creator',
      email: 'real.creator@example.com',
      status: 'Accepted',
      principal_investigator: true
    };
    const created: ProposalBackend = {
      ...pdm,
      prsl_id: 'prsl-new',
      proposal_info: { ...pdm.proposal_info, investigators: [backendPi] }
    };

    test('creates the proposal from the given values and puts the created proposal in the form', async () => {
      mockCreate.mockResolvedValue({ data: created });
      const { form, oda } = renderWithForm('Original title');
      const values = { ...form.current.getValues(), prslId: 'prsl-new', investigators: [] };

      let result;
      await act(async () => {
        result = await oda.current.createInOda(values);
      });

      expect(mockCreate).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          prsl_id: 'prsl-new',
          proposal_info: expect.objectContaining({ title: 'Original title', investigators: [] })
        })
      );
      expect(result).toEqual({ data: mapPdmToForm(created) });
      expect(form.current.getValues('prslId')).toBe('prsl-new');
      // The PI is the one the backend added, not one made up client-side
      expect(form.current.getValues('investigators')).toEqual([
        expect.objectContaining({ id: backendPi.user_id, pi: true })
      ]);
    });

    test('refreshes the token after the create and before returning', async () => {
      mockCreate.mockResolvedValue({ data: created });
      let refreshed = false;
      mockRefreshAuthToken.mockImplementation(async () => {
        refreshed = true;
      });
      const { form, oda } = renderWithForm();

      await act(async () => {
        await oda.current.createInOda(form.current.getValues());
        expect(refreshed).toBe(true);
      });
      expect(mockRefreshAuthToken).toHaveBeenCalledOnce();
    });

    test('returns the error, leaves the form alone and does not refresh when the create fails', async () => {
      mockCreate.mockRejectedValue(new Error('Create failed'));
      const { form, oda } = renderWithForm('Unsaved title');

      let result;
      await act(async () => {
        result = await oda.current.createInOda(form.current.getValues());
      });

      expect(result).toEqual({ error: 'Create failed' });
      expect(form.current.getValues('title')).toBe('Unsaved title');
      expect(mockRefreshAuthToken).not.toHaveBeenCalled();
    });
  });
});

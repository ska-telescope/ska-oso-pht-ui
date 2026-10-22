import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { OSO_SERVICES_PROPOSAL_PATH, PROPOSAL_STATUS } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { ProposalType } from './proposal';
import { useProposalOda } from './useProposalOda';

const { mockGet, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn()
}));
vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: { get: mockGet, put: mockPut } })
}));

const pdm = MockProposalBackend as ProposalBackend;

const renderWithForm = (title = '') => {
  const { result: form } = renderHook(() => useForm<ProposalType>({ defaultValues: { title } }));
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

  test('Save to ODA sends the RHF title together with the legacy proposal in one request', async () => {
    mockPut.mockResolvedValue({ data: pdm });
    const { oda } = renderWithForm('Edited title');
    const legacy = mapping(pdm);

    const saved = await oda.current.saveToOda(legacy);

    const expected = MappingPutProposal(legacy, PROPOSAL_STATUS.DRAFT);
    expect(mockPut).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(`${OSO_SERVICES_PROPOSAL_PATH}/${legacy.id}`),
      {
        ...expected,
        proposal_info: { ...expected.proposal_info, title: 'Edited title' }
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

  test('Save to ODA returns API errors', async () => {
    mockPut.mockRejectedValue(new Error('Save failed'));
    const { oda } = renderWithForm('Edited title');

    expect(await oda.current.saveToOda(mapping(pdm))).toEqual({ error: 'Save failed' });
  });
});

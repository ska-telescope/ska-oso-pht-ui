import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import { getProposalFormDefaults, getProposalFormValues, useProposalForm } from './useProposalForm';
import Investigator from '@/utils/types/investigator';
import { getTeamValues } from './team';
import { PROPOSAL_SUBTYPE, PROPOSAL_TYPE, VELOCITY_DEFINITION } from '@/utils/constants';

const slicesFor = (id: string) => ({
  targets: [
    {
      id: `target-${id}`,
      name: `Target ${id}`,
      kind: 0,
      velocityDefinition: VELOCITY_DEFINITION.RADIO
    }
  ],
  targetObservation: [
    { targetId: `target-${id}`, observationId: `obs-${id}`, dataProductsSDPId: `sdp-${id}` }
  ],
  calibrationStrategy: [
    {
      observatoryDefined: true,
      id: `cal-${id}`,
      observationIdRef: `obs-${id}`,
      calibrators: null,
      notes: null
    }
  ]
});

describe('getProposalFormValues', () => {
  test('takes the title and ID from the proposal and defaults the rest', () => {
    const values = getProposalFormValues({ id: 'p1', title: 'Saved title' });
    expect(values.prslId).toBe('p1');
    expect(values.title).toBe('Saved title');
    expect(values.proposalType).toEqual({ type: null, subTypes: [] });
    expect(values.abstract).toBe('');
    expect(values.scienceCategory).toBeNull();
    expect(values.investigators).toEqual([]);
  });

  test('takes the investigators from the proposal', () => {
    const investigators: Investigator[] = [MockUserFrontendList[0]];
    expect(getProposalFormValues({ investigators }).investigators).toEqual(
      getTeamValues({ investigators }).investigators
    );
  });

  test('takes the document references from the proposal', () => {
    const sciencePDF = { documentId: 'science-doc-p1', isUploadedPdf: true };
    expect(getProposalFormValues({ sciencePDF }).sciencePDF).toEqual(sciencePDF);
    expect(getProposalFormValues({}).sciencePDF).toBeNull();
  });

  test('takes the proposal type and sub-types together', () => {
    expect(
      getProposalFormValues({
        proposalType: PROPOSAL_TYPE.STANDARD,
        proposalSubType: [PROPOSAL_SUBTYPE.JOINT]
      }).proposalType
    ).toEqual({ type: PROPOSAL_TYPE.STANDARD, subTypes: [PROPOSAL_SUBTYPE.JOINT] });
  });

  test('takes targets, links and calibration from the proposal', () => {
    const { targets, targetObservation, calibrationStrategy } = getProposalFormValues(
      slicesFor('p1')
    );
    expect({ targets, targetObservation, calibrationStrategy }).toEqual(slicesFor('p1'));
  });

  test('defaults targets, links and calibration to empty lists', () => {
    const values = getProposalFormValues({ id: 'p1' });
    expect(values.targets).toEqual([]);
    expect(values.targetObservation).toEqual([]);
    expect(values.calibrationStrategy).toEqual([]);
  });
});

describe('useProposalForm', () => {
  test('starts with no proposal open', () => {
    const { result } = renderHook(() => useProposalForm());
    expect(result.current.getValues()).toEqual(getProposalFormDefaults());
  });

  test('starts with the initial values it is given', () => {
    const initialValues = getProposalFormValues({ id: 'p1', title: 'First', ...slicesFor('p1') });
    const { result } = renderHook(() => useProposalForm({}, initialValues));
    expect(result.current.getValues()).toEqual(initialValues);
  });

  // The form is only changed by resetting it (load, create, clone, new proposal, closing)
  test('keeps in-progress edits when re-rendered with other initial values', () => {
    const { result, rerender } = renderHook(
      ({ title }: { title: string }) => useProposalForm({}, getProposalFormValues({ title })),
      { initialProps: { title: 'First' } }
    );

    act(() => result.current.setValue('title', 'Typed title'));
    rerender({ title: 'Second' });

    expect(result.current.getValues('title')).toBe('Typed title');
  });

  test('starts valid with a completed abstract and empty structural slices', async () => {
    const { result } = renderHook(() =>
      useProposalForm(
        {},
        getProposalFormValues({
          id: 'p1',
          title: 'A title',
          proposalType: PROPOSAL_TYPE.STANDARD,
          abstract: 'A valid abstract'
        })
      )
    );
    let valid = false;
    await act(async () => {
      valid = await result.current.trigger();
    });
    expect(valid).toBe(true);
  });
});

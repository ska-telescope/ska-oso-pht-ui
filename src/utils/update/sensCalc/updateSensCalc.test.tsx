import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import updateSensCalc from './updateSensCalc';
import {
  DP_TYPE_IMAGES,
  IW_BRIGGS,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_OK,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_TYPE_INTEGRATION
} from '@/utils/constants';
import Observation from '@/utils/types/observation';
import TargetObservation from '@/utils/types/targetObservation';
import Proposal from '@/utils/types/proposal';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';

// Mock getSensCalc
vi.mock(
  '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData',
  () => ({
    default: vi.fn()
  })
);

describe('updateSensCalc', () => {
  const observation: Observation = {
    id: 'obs1',
    supplied: {
      type: SUPPLIED_TYPE_INTEGRATION,
      value: 1,
      units: SUPPLIED_INTEGRATION_TIME_UNITS_H
    }
  } as Observation;

  const proposalBase: Proposal = {
    targetObservation: [
      {
        observationId: 'obs1',
        targetId: 't1',
        dataProductsSDPId: 'dp1',
        sensCalc: {
          id: 't1',
          title: '',
          statusGUI: 0,
          error: ''
        }
      } as unknown as TargetObservation
    ],
    targets: [{ id: 't1' }] as any,
    dataProductSDP: [{ id: 'dp1' }] as any,
    id: '',
    title: '',
    status: '',
    lastUpdated: '',
    lastUpdatedBy: '',
    createdOn: '',
    createdBy: '',
    version: 0,
    cycle: null,
    proposalType: 0,
    scienceCategory: 0,
    sciencePDF: null,
    calibrationStrategy: [],
    technicalPDF: null
  };

  const dp = { id: 'dp1' } as any; // ✅ pass this into updateSensCalc

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array if proposal.targetObservation is missing', async () => {
    const proposal = { ...proposalBase, targetObservation: undefined } as Proposal;
    const result = await updateSensCalc(proposal, observation, dp);
    expect(result).toEqual([]);
  });

  it('updates sensCalc with result from getSensCalc', async () => {
    (getSensCalc as any).mockResolvedValue({
      id: 't1',
      title: 'calc result',
      statusGUI: STATUS_OK,
      error: ''
    });

    const result = await updateSensCalc(proposalBase, observation, dp);

    expect(result[0].sensCalc).toMatchObject({
      id: 't1',
      title: 'calc result',
      statusGUI: STATUS_OK,
      error: ''
    });
  });

  it('preserves sensitivity calculator errors', async () => {
    (getSensCalc as any).mockResolvedValue({
      statusGUI: STATUS_ERROR,
      error: 'SensCalc error message'
    });

    const result = await updateSensCalc(proposalBase, observation, dp);

    expect(result[0].sensCalc).toMatchObject({
      statusGUI: STATUS_ERROR,
      error: 'SensCalc error message'
    });
  });

  it('does not update records with different observationId', async () => {
    const proposal = {
      ...proposalBase,
      targetObservation: [
        {
          observationId: 'obs2',
          targetId: 't2',
          dataProductsSDPId: 'dp1'
        } as unknown as TargetObservation
      ]
    };
    const result = await updateSensCalc(proposal, observation, dp);
    expect(result[0].sensCalc).toBeUndefined();
  });

  it('does not call sensitivity calculator when supplied input is invalid', async () => {
    const observationWithInvalidSupplied = {
      ...observation,
      supplied: {
        type: SUPPLIED_TYPE_INTEGRATION,
        value: Number.NaN,
        units: SUPPLIED_INTEGRATION_TIME_UNITS_H
      }
    } as Observation;

    const result = await updateSensCalc(proposalBase, observationWithInvalidSupplied, dp);

    expect(getSensCalc).not.toHaveBeenCalled();
    expect(result[0].sensCalc).toMatchObject({
      title: '',
      statusGUI: STATUS_INITIAL,
      error: ''
    });
  });

  it('does not call sensitivity calculator when Briggs robust input is invalid', async () => {
    const dataProductWithInvalidRobust = {
      id: 'dp1',
      data: {
        dataProductType: DP_TYPE_IMAGES,
        weighting: IW_BRIGGS,
        robust: Number.NaN
      }
    } as any;

    const result = await updateSensCalc(proposalBase, observation, dataProductWithInvalidRobust);

    expect(getSensCalc).not.toHaveBeenCalled();
    expect(result[0].sensCalc).toMatchObject({
      title: '',
      statusGUI: STATUS_INITIAL,
      error: ''
    });
  });
});

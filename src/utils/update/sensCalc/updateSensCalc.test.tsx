import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateSensCalc from './updateSensCalc';
import { STATUS_PARTIAL } from '@/utils/constants';
import { calculateSensCalcData } from '@/utils/sensCalc/sensCalc';
import Observation from '@/utils/types/observation';
import TargetObservation from '@/utils/types/targetObservation';
import Proposal from '@/utils/types/proposal';

// Mock calculateSensCalcData
vi.mock('@/utils/sensCalc/sensCalc', () => ({
  calculateSensCalcData: vi.fn()
}));

describe('updateSensCalc', () => {
  const observation: Observation = { id: 'obs1' } as Observation;

  const proposalBase: Proposal = {
    targetObservation: [
      ({
        observationId: 'obs1',
        targetId: 't1',
        dataProductsSDPId: 'dp1',
        sensCalc: {
          id: 't1',
          title: '',
          statusGUI: 0,
          error: ''
        }
      } as unknown) as TargetObservation
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

  it('returns empty array if proposal.targetObservation is missing', async () => {
    const proposal = { ...proposalBase, targetObservation: undefined } as Proposal;
    const result = await updateSensCalc(proposal, observation, dp);
    expect(result).toEqual([]);
  });

  it('updates sensCalc with result from calculateSensCalcData', async () => {
    (calculateSensCalcData as any).mockResolvedValue({
      id: 't1',
      title: 'calc result',
      statusGUI: 42,
      error: ''
    });

    const result = await updateSensCalc(proposalBase, observation, dp);

    expect(result[0].sensCalc).toMatchObject({
      id: 't1',
      title: 'calc result',
      statusGUI: STATUS_PARTIAL, // forced override
      error: ''
    });
  });

  it('falls back to default sensCalc when calculateSensCalcData returns null', async () => {
    (calculateSensCalcData as any).mockResolvedValue(null);

    const result = await updateSensCalc(proposalBase, observation, dp);

    expect(result[0].sensCalc).toMatchObject({
      id: 't1',
      title: '',
      statusGUI: STATUS_PARTIAL, // override applied
      error: 'SensCalc failed'
    });
  });

  it('does not update records with different observationId', async () => {
    const proposal = {
      ...proposalBase,
      targetObservation: [
        ({
          observationId: 'obs2',
          targetId: 't2',
          dataProductsSDPId: 'dp2'
        } as unknown) as TargetObservation
      ]
    };
    const result = await updateSensCalc(proposal, observation, dp);
    expect(result[0].sensCalc).toBeUndefined();
  });
});

import { Target } from 'node:inspector';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import { DataProductSDP } from '@utils/types/dataProduct.tsx';
import Observation from '@utils/types/observation.tsx';
import deleteAutoLinking from '@utils/autoLinking/DeleteAutoLinking.tsx';

describe('deleteAutoLinking', () => {
  const target: Target = { id: 't1' } as Target;
  const proposal = {
    targets: [{ id: 't1' }, { id: 't2' }],
    targetObservation: [
      { targetId: 't1', observationId: 'o1' },
      { targetId: 't2', observationId: 'o2' }
    ] as TargetObservation[],
    calibrationStrategy: [
      { observationIdRef: 'o1' },
      { observationIdRef: 'o2' }
    ] as CalibrationStrategy[],
    dataProductSDP: [{ observationId: 'o1' }, { observationId: 'o2' }] as DataProductSDP[],
    observations: [{ id: 'o1' }, { id: 'o2' }] as Observation[]
  };

  let getProposal: () => typeof proposal;
  let setProposal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getProposal = () => ({ ...proposal });
    setProposal = vi.fn();
  });

  it('removes the target and all associated data', async () => {
    await deleteAutoLinking(target, getProposal, setProposal);

    expect(setProposal).toHaveBeenCalledWith({
      ...proposal,
      targets: [{ id: 't2' }],
      targetObservation: [{ targetId: 't2', observationId: 'o2' }],
      calibrationStrategy: [{ observationIdRef: 'o2' }],
      dataProductSDP: [{ observationId: 'o2' }],
      observations: [{ id: 'o2' }]
    });
  });

  it('does nothing if target is not found', async () => {
    const missingTarget = { id: 'notfound' } as Target;
    await deleteAutoLinking(missingTarget, getProposal, setProposal);

    expect(setProposal).toHaveBeenCalledWith({
      ...proposal,
      targets: [{ id: 't1' }, { id: 't2' }],
      targetObservation: [
        { targetId: 't1', observationId: 'o1' },
        { targetId: 't2', observationId: 'o2' }
      ],
      calibrationStrategy: [{ observationIdRef: 'o1' }, { observationIdRef: 'o2' }],
      dataProductSDP: [{ observationId: 'o1' }, { observationId: 'o2' }],
      observations: [{ id: 'o1' }, { id: 'o2' }]
    });
  });

  it('handles missing calibrationStrategy gracefully', async () => {
    getProposal = () => ({
      ...proposal,
      calibrationStrategy: undefined
    });
    await deleteAutoLinking(target, getProposal, setProposal);

    expect(setProposal).toHaveBeenCalledWith({
      ...proposal,
      calibrationStrategy: undefined,
      targets: [{ id: 't2' }],
      targetObservation: [{ targetId: 't2', observationId: 'o2' }],
      dataProductSDP: [{ observationId: 'o2' }],
      observations: [{ id: 'o2' }]
    });
  });
});
